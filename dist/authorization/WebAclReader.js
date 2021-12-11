"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebAclReader = void 0;
const n3_1 = require("n3");
const Credentials_1 = require("../authentication/Credentials");
const LogUtil_1 = require("../logging/LogUtil");
const ContentTypes_1 = require("../util/ContentTypes");
const ErrorUtil_1 = require("../util/errors/ErrorUtil");
const ForbiddenHttpError_1 = require("../util/errors/ForbiddenHttpError");
const InternalServerError_1 = require("../util/errors/InternalServerError");
const NotFoundHttpError_1 = require("../util/errors/NotFoundHttpError");
const StreamUtil_1 = require("../util/StreamUtil");
const Vocabularies_1 = require("../util/Vocabularies");
const PermissionReader_1 = require("./PermissionReader");
const AclPermission_1 = require("./permissions/AclPermission");
const Permissions_1 = require("./permissions/Permissions");
const modesMap = {
    [Vocabularies_1.ACL.Read]: Permissions_1.AccessMode.read,
    [Vocabularies_1.ACL.Write]: Permissions_1.AccessMode.write,
    [Vocabularies_1.ACL.Append]: Permissions_1.AccessMode.append,
    [Vocabularies_1.ACL.Control]: AclPermission_1.AclMode.control,
};
/**
 * Handles permissions according to the WAC specification.
 * Specific access checks are done by the provided {@link AccessChecker}.
 */
class WebAclReader extends PermissionReader_1.PermissionReader {
    constructor(aclStrategy, aclStore, identifierStrategy, accessChecker) {
        super();
        this.logger = LogUtil_1.getLoggerFor(this);
        this.aclStrategy = aclStrategy;
        this.aclStore = aclStore;
        this.identifierStrategy = identifierStrategy;
        this.accessChecker = accessChecker;
    }
    /**
     * Checks if an agent is allowed to execute the requested actions.
     * Will throw an error if this is not the case.
     * @param input - Relevant data needed to check if access can be granted.
     */
    async handle({ identifier, credentials }) {
        var _a;
        // Determine the required access modes
        this.logger.debug(`Retrieving permissions of ${(_a = credentials.agent) === null || _a === void 0 ? void 0 : _a.webId} for ${identifier.path}`);
        const isAcl = this.aclStrategy.isAuxiliaryIdentifier(identifier);
        const mainIdentifier = isAcl ? this.aclStrategy.getSubjectIdentifier(identifier) : identifier;
        // Determine the full authorization for the agent granted by the applicable ACL
        const acl = await this.getAclRecursive(mainIdentifier);
        return this.createPermissions(credentials, acl, isAcl);
    }
    /**
     * Creates an Authorization object based on the quads found in the ACL.
     * @param credentials - Credentials to check permissions for.
     * @param acl - Store containing all relevant authorization triples.
     * @param isAcl - If the target resource is an acl document.
     */
    async createPermissions(credentials, acl, isAcl) {
        const publicPermissions = await this.determinePermissions(acl, credentials.public);
        const agentPermissions = await this.determinePermissions(acl, credentials.agent);
        return {
            [Credentials_1.CredentialGroup.agent]: this.updateAclPermissions(agentPermissions, isAcl),
            [Credentials_1.CredentialGroup.public]: this.updateAclPermissions(publicPermissions, isAcl),
        };
    }
    /**
     * Determines the available permissions for the given credentials.
     * Will deny all permissions if credentials are not defined
     * @param acl - Store containing all relevant authorization triples.
     * @param credentials - Credentials to find the permissions for.
     */
    async determinePermissions(acl, credentials) {
        const aclPermissions = {};
        if (!credentials) {
            return aclPermissions;
        }
        // Apply all ACL rules
        const aclRules = acl.getSubjects(Vocabularies_1.RDF.type, Vocabularies_1.ACL.Authorization, null);
        for (const rule of aclRules) {
            const hasAccess = await this.accessChecker.handleSafe({ acl, rule, credential: credentials });
            if (hasAccess) {
                // Set all allowed modes to true
                const modes = acl.getObjects(rule, Vocabularies_1.ACL.mode, null);
                for (const { value: mode } of modes) {
                    if (mode in modesMap) {
                        aclPermissions[modesMap[mode]] = true;
                    }
                }
            }
        }
        if (aclPermissions.write) {
            // Write permission implies Append permission
            aclPermissions.append = true;
        }
        return aclPermissions;
    }
    /**
     * Sets the correct values for non-acl permissions such as create and delete.
     * Also adds the correct values to indicate that having control permission
     * implies having read/write/etc. on the acl resource.
     *
     * The main reason for keeping the control value is so we can correctly set the WAC-Allow header later.
     */
    updateAclPermissions(aclPermissions, isAcl) {
        if (isAcl) {
            return {
                read: aclPermissions.control,
                append: aclPermissions.control,
                write: aclPermissions.control,
                create: aclPermissions.control,
                delete: aclPermissions.control,
                control: aclPermissions.control,
            };
        }
        return {
            ...aclPermissions,
            create: aclPermissions.write,
            delete: aclPermissions.write,
        };
    }
    /**
     * Returns the ACL triples that are relevant for the given identifier.
     * These can either be from a corresponding ACL document or an ACL document higher up with defaults.
     * Rethrows any non-NotFoundHttpErrors thrown by the ResourceStore.
     * @param id - ResourceIdentifier of which we need the ACL triples.
     * @param recurse - Only used internally for recursion.
     *
     * @returns A store containing the relevant ACL triples.
     */
    async getAclRecursive(id, recurse) {
        // Obtain the direct ACL document for the resource, if it exists
        this.logger.debug(`Trying to read the direct ACL document of ${id.path}`);
        try {
            const acl = this.aclStrategy.getAuxiliaryIdentifier(id);
            this.logger.debug(`Trying to read the ACL document ${acl.path}`);
            const data = await this.aclStore.getRepresentation(acl, { type: { [ContentTypes_1.INTERNAL_QUADS]: 1 } });
            this.logger.info(`Reading ACL statements from ${acl.path}`);
            return await this.filterData(data, recurse ? Vocabularies_1.ACL.default : Vocabularies_1.ACL.accessTo, id.path);
        }
        catch (error) {
            if (NotFoundHttpError_1.NotFoundHttpError.isInstance(error)) {
                this.logger.debug(`No direct ACL document found for ${id.path}`);
            }
            else {
                const message = `Error reading ACL for ${id.path}: ${ErrorUtil_1.createErrorMessage(error)}`;
                this.logger.error(message);
                throw new InternalServerError_1.InternalServerError(message, { cause: error });
            }
        }
        // Obtain the applicable ACL of the parent container
        this.logger.debug(`Traversing to the parent of ${id.path}`);
        if (this.identifierStrategy.isRootContainer(id)) {
            this.logger.error(`No ACL document found for root container ${id.path}`);
            // Solid, §10.1: "In the event that a server can’t apply an ACL to a resource, it MUST deny access."
            // https://solid.github.io/specification/protocol#web-access-control
            throw new ForbiddenHttpError_1.ForbiddenHttpError('No ACL document found for root container');
        }
        const parent = this.identifierStrategy.getParentContainer(id);
        return this.getAclRecursive(parent, true);
    }
    /**
     * Finds all triples in the data stream of the given representation that use the given predicate and object.
     * Then extracts the unique subjects from those triples,
     * and returns a Store containing all triples from the data stream that have such a subject.
     *
     * This can be useful for finding the `acl:Authorization` objects corresponding to a specific URI
     * and returning all relevant information on them.
     * @param data - Representation with data stream of internal/quads.
     * @param predicate - Predicate to match.
     * @param object - Object to match.
     *
     * @returns A store containing the relevant triples.
     */
    async filterData(data, predicate, object) {
        // Import all triples from the representation into a queryable store
        const quads = await StreamUtil_1.readableToQuads(data.data);
        // Find subjects that occur with a given predicate/object, and collect all their triples
        const subjectData = new n3_1.Store();
        const subjects = quads.getQuads(null, predicate, object, null).map((quad) => quad.subject);
        subjects.forEach((subject) => subjectData.addQuads(quads.getQuads(subject, null, null, null)));
        return subjectData;
    }
}
exports.WebAclReader = WebAclReader;
//# sourceMappingURL=WebAclReader.js.map