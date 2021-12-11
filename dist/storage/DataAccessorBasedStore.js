"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataAccessorBasedStore = void 0;
const arrayify_stream_1 = __importDefault(require("arrayify-stream"));
const n3_1 = require("n3");
const uuid_1 = require("uuid");
const __1 = require("..");
const BasicRepresentation_1 = require("../http/representation/BasicRepresentation");
const LogUtil_1 = require("../logging/LogUtil");
const ContentTypes_1 = require("../util/ContentTypes");
const BadRequestHttpError_1 = require("../util/errors/BadRequestHttpError");
const ConflictHttpError_1 = require("../util/errors/ConflictHttpError");
const ErrorUtil_1 = require("../util/errors/ErrorUtil");
const ForbiddenHttpError_1 = require("../util/errors/ForbiddenHttpError");
const MethodNotAllowedHttpError_1 = require("../util/errors/MethodNotAllowedHttpError");
const NotFoundHttpError_1 = require("../util/errors/NotFoundHttpError");
const NotImplementedHttpError_1 = require("../util/errors/NotImplementedHttpError");
const PreconditionFailedHttpError_1 = require("../util/errors/PreconditionFailedHttpError");
const PathUtil_1 = require("../util/PathUtil");
const QuadUtil_1 = require("../util/QuadUtil");
const ResourceUtil_1 = require("../util/ResourceUtil");
const Vocabularies_1 = require("../util/Vocabularies");
const ResourceStore_1 = require("./ResourceStore");
/**
 * ResourceStore which uses a DataAccessor for backend access.
 *
 * The DataAccessor interface provides elementary store operations such as read and write.
 * This DataAccessorBasedStore uses those elementary store operations
 * to implement the more high-level ResourceStore contact, abstracting all common functionality
 * such that new stores can be added by implementing the more simple DataAccessor contract.
 * DataAccessorBasedStore thereby provides behaviours for reuse across different stores, such as:
 *  * Converting container metadata to data
 *  * Converting slug to URI
 *  * Checking if addResource target is a container
 *  * Checking if no containment triples are written to a container
 *  * etc.
 *
 * Currently "metadata" is seen as something that is not directly accessible.
 * That means that a consumer can't write directly to the metadata of a resource, only indirectly through headers.
 * (Except for containers where data and metadata overlap).
 *
 * The one thing this store does not take care of (yet?) are containment triples for containers
 *
 * Work has been done to minimize the number of required calls to the DataAccessor,
 * but the main disadvantage is that sometimes multiple calls are required where a specific store might only need one.
 */
class DataAccessorBasedStore {
    constructor(accessor, identifierStrategy, auxiliaryStrategy) {
        this.logger = LogUtil_1.getLoggerFor(this);
        this.accessor = accessor;
        this.identifierStrategy = identifierStrategy;
        this.auxiliaryStrategy = auxiliaryStrategy;
    }
    async resourceExists(identifier) {
        try {
            this.validateIdentifier(identifier);
            await this.accessor.getMetadata(identifier);
            return true;
        }
        catch (error) {
            if (NotFoundHttpError_1.NotFoundHttpError.isInstance(error)) {
                return false;
            }
            throw error;
        }
    }
    async getRepresentation(identifier) {
        this.validateIdentifier(identifier);
        // In the future we want to use getNormalizedMetadata and redirect in case the identifier differs
        const metadata = await this.accessor.getMetadata(identifier);
        let representation;
        // Potentially add auxiliary related metadata
        // Solid, §4.3: "Clients can discover auxiliary resources associated with a subject resource by making an HTTP HEAD
        // or GET request on the target URL, and checking the HTTP Link header with the rel parameter"
        // https://solid.github.io/specification/protocol#auxiliary-resources
        await this.auxiliaryStrategy.addMetadata(metadata);
        if (PathUtil_1.isContainerPath(metadata.identifier.value)) {
            // Add containment triples of non-auxiliary resources
            for await (const child of this.accessor.getChildren(identifier)) {
                if (!this.auxiliaryStrategy.isAuxiliaryIdentifier({ path: child.identifier.value })) {
                    metadata.addQuads(child.quads());
                    metadata.add(Vocabularies_1.LDP.terms.contains, child.identifier, Vocabularies_1.SOLID_META.terms.ResponseMetadata);
                }
            }
            // Generate a container representation from the metadata
            // All triples should be in the same graph for the data representation
            const data = metadata.quads().map((triple) => {
                if (triple.graph.termType === 'DefaultGraph') {
                    return triple;
                }
                return n3_1.DataFactory.quad(triple.subject, triple.predicate, triple.object);
            });
            metadata.addQuad(Vocabularies_1.DC.terms.namespace, Vocabularies_1.PREFERRED_PREFIX_TERM, 'dc', Vocabularies_1.SOLID_META.terms.ResponseMetadata);
            metadata.addQuad(Vocabularies_1.LDP.terms.namespace, Vocabularies_1.PREFERRED_PREFIX_TERM, 'ldp', Vocabularies_1.SOLID_META.terms.ResponseMetadata);
            metadata.addQuad(Vocabularies_1.POSIX.terms.namespace, Vocabularies_1.PREFERRED_PREFIX_TERM, 'posix', Vocabularies_1.SOLID_META.terms.ResponseMetadata);
            metadata.addQuad(Vocabularies_1.XSD.terms.namespace, Vocabularies_1.PREFERRED_PREFIX_TERM, 'xsd', Vocabularies_1.SOLID_META.terms.ResponseMetadata);
            representation = new BasicRepresentation_1.BasicRepresentation(data, metadata, ContentTypes_1.INTERNAL_QUADS);
        }
        else {
            // Retrieve a document representation from the accessor
            representation = new BasicRepresentation_1.BasicRepresentation(await this.accessor.getData(identifier), metadata);
        }
        return representation;
    }
    async addResource(container, representation, conditions) {
        this.validateIdentifier(container);
        const parentMetadata = await this.getSafeNormalizedMetadata(container);
        // Solid, §5.3: "When a POST method request targets a resource without an existing representation,
        // the server MUST respond with the 404 status code."
        // https://solid.github.io/specification/protocol#writing-resources
        if (!parentMetadata) {
            throw new NotFoundHttpError_1.NotFoundHttpError();
        }
        // Not using `container` since `getSafeNormalizedMetadata` might return metadata for a different identifier.
        // Solid, §5: "Servers MUST respond with the 405 status code to requests using HTTP methods
        // that are not supported by the target resource."
        // https://solid.github.io/specification/protocol#reading-writing-resources
        if (!PathUtil_1.isContainerPath(parentMetadata.identifier.value)) {
            throw new MethodNotAllowedHttpError_1.MethodNotAllowedHttpError('The given path is not a container.');
        }
        this.validateConditions(conditions, parentMetadata);
        // Solid, §5.1: "Servers MAY allow clients to suggest the URI of a resource created through POST,
        // using the HTTP Slug header as defined in [RFC5023].
        // Clients who want the server to assign a URI of a resource, MUST use the POST request."
        // https://solid.github.io/specification/protocol#resource-type-heuristics
        const newID = await this.createSafeUri(container, representation.metadata);
        const isContainer = PathUtil_1.isContainerIdentifier(newID);
        // Ensure the representation is supported by the accessor
        // Containers are not checked because uploaded representations are treated as metadata
        if (!isContainer) {
            await this.accessor.canHandle(representation);
        }
        // Write the data. New containers should never be made for a POST request.
        await this.writeData(newID, representation, isContainer, false, false);
        return ResourceStore_1.createModifiedResource(newID, __1.ModificationType.created);
    }
    async setRepresentation(identifier, representation, conditions) {
        this.validateIdentifier(identifier);
        // Check if the resource already exists
        const oldMetadata = await this.getSafeNormalizedMetadata(identifier);
        // Might want to redirect in the future.
        // See #480
        // Solid, §3.1: "If two URIs differ only in the trailing slash, and the server has associated a resource with
        // one of them, then the other URI MUST NOT correspond to another resource. Instead, the server MAY respond to
        // requests for the latter URI with a 301 redirect to the former."
        // https://solid.github.io/specification/protocol#uri-slash-semantics
        if (oldMetadata && oldMetadata.identifier.value !== identifier.path) {
            throw new ConflictHttpError_1.ConflictHttpError(`${identifier.path} conflicts with existing path ${oldMetadata.identifier.value}`);
        }
        const isContainer = this.isNewContainer(representation.metadata, identifier.path);
        // Solid, §3.1: "Paths ending with a slash denote a container resource."
        // https://solid.github.io/specification/protocol#uri-slash-semantics
        if (isContainer !== PathUtil_1.isContainerIdentifier(identifier)) {
            throw new BadRequestHttpError_1.BadRequestHttpError('Containers should have a `/` at the end of their path, resources should not.');
        }
        // Ensure the representation is supported by the accessor
        // Containers are not checked because uploaded representations are treated as metadata
        if (!isContainer) {
            await this.accessor.canHandle(representation);
        }
        this.validateConditions(conditions, oldMetadata);
        // Potentially have to create containers if it didn't exist yet
        return this.writeData(identifier, representation, isContainer, !oldMetadata, Boolean(oldMetadata));
    }
    async modifyResource(identifier, patch, conditions) {
        if (conditions) {
            let metadata;
            try {
                metadata = await this.accessor.getMetadata(identifier);
            }
            catch (error) {
                if (!NotFoundHttpError_1.NotFoundHttpError.isInstance(error)) {
                    throw error;
                }
            }
            this.validateConditions(conditions, metadata);
        }
        throw new NotImplementedHttpError_1.NotImplementedHttpError('Patches are not supported by the default store.');
    }
    async deleteResource(identifier, conditions) {
        this.validateIdentifier(identifier);
        const metadata = await this.accessor.getMetadata(identifier);
        // Solid, §5.4: "When a DELETE request targets storage’s root container or its associated ACL resource,
        // the server MUST respond with the 405 status code."
        // https://solid.github.io/specification/protocol#deleting-resources
        if (this.isRootStorage(metadata)) {
            throw new MethodNotAllowedHttpError_1.MethodNotAllowedHttpError('Cannot delete a root storage container.');
        }
        if (this.auxiliaryStrategy.isAuxiliaryIdentifier(identifier) &&
            this.auxiliaryStrategy.isRequiredInRoot(identifier)) {
            const subjectIdentifier = this.auxiliaryStrategy.getSubjectIdentifier(identifier);
            const parentMetadata = await this.accessor.getMetadata(subjectIdentifier);
            if (this.isRootStorage(parentMetadata)) {
                throw new MethodNotAllowedHttpError_1.MethodNotAllowedHttpError(`Cannot delete ${identifier.path} from a root storage container.`);
            }
        }
        // Solid, §5.4: "When a DELETE request is made to a container, the server MUST delete the container
        // if it contains no resources. If the container contains resources,
        // the server MUST respond with the 409 status code and response body describing the error."
        // https://solid.github.io/specification/protocol#deleting-resources
        // Auxiliary resources are not counted when deleting a container since they will also be deleted.
        if (PathUtil_1.isContainerIdentifier(identifier) && await this.hasProperChildren(identifier)) {
            throw new ConflictHttpError_1.ConflictHttpError('Can only delete empty containers.');
        }
        this.validateConditions(conditions, metadata);
        // Solid, §5.4: "When a contained resource is deleted,
        // the server MUST also delete the associated auxiliary resources"
        // https://solid.github.io/specification/protocol#deleting-resources
        const modfied = [ResourceStore_1.createModifiedResource(identifier, __1.ModificationType.deleted)];
        if (!this.auxiliaryStrategy.isAuxiliaryIdentifier(identifier)) {
            const auxiliaries = this.auxiliaryStrategy.getAuxiliaryIdentifiers(identifier);
            modfied.push(...(await this.safelyDeleteAuxiliaryResources(auxiliaries))
                .map((id) => ResourceStore_1.createModifiedResource(id, __1.ModificationType.deleted)));
        }
        if (!this.identifierStrategy.isRootContainer(identifier)) {
            const container = this.identifierStrategy.getParentContainer(identifier);
            modfied.push(ResourceStore_1.createModifiedResource(container, __1.ModificationType.changed));
            // Update modified date of parent
            await this.updateContainerModifiedDate(container);
        }
        await this.accessor.deleteResource(identifier);
        return modfied;
    }
    /**
     * Verify if the given identifier matches the stored base.
     */
    validateIdentifier(identifier) {
        if (!this.identifierStrategy.supportsIdentifier(identifier)) {
            throw new NotFoundHttpError_1.NotFoundHttpError();
        }
    }
    /**
     * Verify if the given metadata matches the conditions.
     */
    validateConditions(conditions, metadata) {
        // The 412 (Precondition Failed) status code indicates
        // that one or more conditions given in the request header fields evaluated to false when tested on the server.
        if (conditions && !conditions.matchesMetadata(metadata)) {
            throw new PreconditionFailedHttpError_1.PreconditionFailedHttpError();
        }
    }
    /**
     * Returns the metadata matching the identifier, ignoring the presence of a trailing slash or not.
     *
     * Solid, §3.1: "If two URIs differ only in the trailing slash,
     * and the server has associated a resource with one of them,
     * then the other URI MUST NOT correspond to another resource."
     * https://solid.github.io/specification/protocol#uri-slash-semantics
     *
     * First the identifier gets requested and if no result is found
     * the identifier with differing trailing slash is requested.
     * @param identifier - Identifier that needs to be checked.
     */
    async getNormalizedMetadata(identifier) {
        const hasSlash = PathUtil_1.isContainerIdentifier(identifier);
        try {
            return await this.accessor.getMetadata(identifier);
        }
        catch (error) {
            if (NotFoundHttpError_1.NotFoundHttpError.isInstance(error)) {
                const otherIdentifier = { path: hasSlash ? PathUtil_1.trimTrailingSlashes(identifier.path) : PathUtil_1.ensureTrailingSlash(identifier.path) };
                // Only try to access other identifier if it is valid in the scope of the DataAccessor
                this.validateIdentifier(otherIdentifier);
                return this.accessor.getMetadata(otherIdentifier);
            }
            throw error;
        }
    }
    /**
     * Returns the result of `getNormalizedMetadata` or undefined if a 404 error is thrown.
     */
    async getSafeNormalizedMetadata(identifier) {
        try {
            return await this.getNormalizedMetadata(identifier);
        }
        catch (error) {
            if (!NotFoundHttpError_1.NotFoundHttpError.isInstance(error)) {
                throw error;
            }
        }
    }
    /**
     * Write the given resource to the DataAccessor. Metadata will be updated with necessary triples.
     * In case of containers `handleContainerData` will be used to verify the data.
     * @param identifier - Identifier of the resource.
     * @param representation - Corresponding Representation.
     * @param isContainer - Is the incoming resource a container?
     * @param createContainers - Should parent containers (potentially) be created?
     * @param exists - If the resource already exists.
     *
     * @returns Identifiers of resources that were possibly modified.
     */
    async writeData(identifier, representation, isContainer, createContainers, exists) {
        // Make sure the metadata has the correct identifier and correct type quads
        // Need to do this before handling container data to have the correct identifier
        representation.metadata.identifier = n3_1.DataFactory.namedNode(identifier.path);
        ResourceUtil_1.addResourceMetadata(representation.metadata, isContainer);
        // Validate container data
        if (isContainer) {
            await this.handleContainerData(representation);
        }
        // Validate auxiliary data
        if (this.auxiliaryStrategy.isAuxiliaryIdentifier(identifier)) {
            await this.auxiliaryStrategy.validate(representation);
        }
        // Add date modified metadata
        ResourceUtil_1.updateModifiedDate(representation.metadata);
        // Root container should not have a parent container
        // Solid, §5.3: "Servers MUST create intermediate containers and include corresponding containment triples
        // in container representations derived from the URI path component of PUT and PATCH requests."
        // https://solid.github.io/specification/protocol#writing-resources
        const modified = [];
        if (!this.identifierStrategy.isRootContainer(identifier) && !exists) {
            const container = this.identifierStrategy.getParentContainer(identifier);
            if (!createContainers) {
                modified.push(ResourceStore_1.createModifiedResource(container, __1.ModificationType.changed));
            }
            else {
                const createdResources = await this.createRecursiveContainers(container);
                // The parent container is marked 'changed'
                modified.push(...createdResources.length === 0 ?
                    [ResourceStore_1.createModifiedResource(container, __1.ModificationType.changed)] :
                    createdResources);
            }
            // Parent container is also modified
            await this.updateContainerModifiedDate(container);
        }
        // Remove all generated metadata to prevent it from being stored permanently
        this.removeResponseMetadata(representation.metadata);
        await (isContainer ?
            this.accessor.writeContainer(identifier, representation.metadata) :
            this.accessor.writeDocument(identifier, representation.data, representation.metadata));
        return [
            ...modified,
            exists ?
                ResourceStore_1.createModifiedResource(identifier, __1.ModificationType.changed) :
                ResourceStore_1.createModifiedResource(identifier, __1.ModificationType.created),
        ];
    }
    /**
     * Verify if the incoming data for a container is valid (RDF and no containment triples).
     * Adds the container data to its metadata afterwards.
     *
     * @param representation - Container representation.
     */
    async handleContainerData(representation) {
        let quads;
        try {
            // No need to parse the data if it already contains internal/quads
            if (representation.metadata.contentType === ContentTypes_1.INTERNAL_QUADS) {
                quads = await arrayify_stream_1.default(representation.data);
            }
            else {
                const { contentType, identifier } = representation.metadata;
                quads = await QuadUtil_1.parseQuads(representation.data, { format: contentType, baseIRI: identifier.value });
            }
        }
        catch (error) {
            throw new BadRequestHttpError_1.BadRequestHttpError(`Can only create containers with RDF data. ${ErrorUtil_1.createErrorMessage(error)}`, { cause: error });
        }
        // Solid, §5.3: "Servers MUST NOT allow HTTP POST, PUT and PATCH to update a container’s containment triples;
        // if the server receives such a request, it MUST respond with a 409 status code."
        // https://solid.github.io/specification/protocol#writing-resources
        if (quads.some((quad) => quad.predicate.value === Vocabularies_1.LDP.contains)) {
            throw new ConflictHttpError_1.ConflictHttpError('Container bodies are not allowed to have containment triples.');
        }
        // Input content type doesn't matter anymore
        representation.metadata.removeAll(Vocabularies_1.CONTENT_TYPE);
        // Container data is stored in the metadata
        representation.metadata.addQuads(quads);
    }
    /**
     * Removes all generated data from metadata to prevent it from being stored permanently.
     */
    removeResponseMetadata(metadata) {
        metadata.removeQuads(metadata.quads(null, null, null, Vocabularies_1.SOLID_META.terms.ResponseMetadata));
    }
    /**
     * Updates the last modified date of the given container
     */
    async updateContainerModifiedDate(container) {
        const parentMetadata = await this.accessor.getMetadata(container);
        ResourceUtil_1.updateModifiedDate(parentMetadata);
        this.removeResponseMetadata(parentMetadata);
        await this.accessor.writeContainer(container, parentMetadata);
    }
    /**
     * Generates a new URI for a resource in the given container, potentially using the given slug.
     *
     * Solid, §5.3: "Servers MUST allow creating new resources with a POST request to URI path ending `/`.
     * Servers MUST create a resource with URI path ending `/{id}` in container `/`.
     * Servers MUST create a container with URI path ending `/{id}/` in container `/` for requests
     * including the HTTP Link header with rel="type" targeting a valid LDP container type."
     * https://solid.github.io/specification/protocol#writing-resources
     *
     * @param container - Parent container of the new URI.
     * @param isContainer - Does the new URI represent a container?
     * @param slug - Slug to use for the new URI.
     */
    createURI(container, isContainer, slug) {
        var _a;
        const base = PathUtil_1.ensureTrailingSlash(container.path);
        const name = (_a = (slug && this.cleanSlug(slug))) !== null && _a !== void 0 ? _a : uuid_1.v4();
        const suffix = isContainer ? '/' : '';
        return { path: `${base}${name}${suffix}` };
    }
    /**
     * Clean http Slug to be compatible with the server. Makes sure there are no unwanted characters
     * e.g.: cleanslug('&%26') returns '%26%26'
     * @param slug - the slug to clean
     */
    cleanSlug(slug) {
        if (/\/[^/]/u.test(slug)) {
            throw new BadRequestHttpError_1.BadRequestHttpError('Slugs should not contain slashes');
        }
        return PathUtil_1.toCanonicalUriPath(PathUtil_1.trimTrailingSlashes(slug));
    }
    /**
     * Generate a valid URI to store a new Resource in the given container.
     * URI will be based on the slug header if there is one and is guaranteed to not exist yet.
     *
     * @param container - Identifier of the target container.
     * @param metadata - Metadata of the new resource.
     */
    async createSafeUri(container, metadata) {
        var _a;
        // Get all values needed for naming the resource
        const isContainer = this.isNewContainer(metadata);
        const slug = (_a = metadata.get(Vocabularies_1.SOLID_HTTP.slug)) === null || _a === void 0 ? void 0 : _a.value;
        metadata.removeAll(Vocabularies_1.SOLID_HTTP.slug);
        let newID = this.createURI(container, isContainer, slug);
        // Solid, §5.3: "When a POST method request with the Slug header targets an auxiliary resource,
        // the server MUST respond with the 403 status code and response body describing the error."
        // https://solid.github.io/specification/protocol#writing-resources
        if (this.auxiliaryStrategy.isAuxiliaryIdentifier(newID)) {
            throw new ForbiddenHttpError_1.ForbiddenHttpError('Slug bodies that would result in an auxiliary resource are forbidden');
        }
        // Make sure we don't already have a resource with this exact name (or with differing trailing slash)
        const withSlash = { path: PathUtil_1.ensureTrailingSlash(newID.path) };
        const withoutSlash = { path: PathUtil_1.trimTrailingSlashes(newID.path) };
        if (await this.resourceExists(withSlash) || await this.resourceExists(withoutSlash)) {
            newID = this.createURI(container, isContainer);
        }
        return newID;
    }
    /**
     * Checks if the given metadata represents a (potential) container,
     * both based on the metadata and the URI.
     * @param metadata - Metadata of the (new) resource.
     * @param suffix - Suffix of the URI. Can be the full URI, but only the last part is required.
     */
    isNewContainer(metadata, suffix) {
        var _a;
        if (this.hasContainerType(metadata.getAll(Vocabularies_1.RDF.type))) {
            return true;
        }
        const slug = suffix !== null && suffix !== void 0 ? suffix : (_a = metadata.get(Vocabularies_1.SOLID_HTTP.slug)) === null || _a === void 0 ? void 0 : _a.value;
        return Boolean(slug && PathUtil_1.isContainerPath(slug));
    }
    /**
     * Checks in a list of types if any of them match a Container type.
     */
    hasContainerType(rdfTypes) {
        return rdfTypes.some((type) => type.value === Vocabularies_1.LDP.Container || type.value === Vocabularies_1.LDP.BasicContainer);
    }
    /**
     * Verifies if this is the metadata of a root storage container.
     */
    isRootStorage(metadata) {
        return metadata.getAll(Vocabularies_1.RDF.type).some((term) => term.value === Vocabularies_1.PIM.Storage);
    }
    /**
     * Checks if the given container has any non-auxiliary resources.
     */
    async hasProperChildren(container) {
        for await (const child of this.accessor.getChildren(container)) {
            if (!this.auxiliaryStrategy.isAuxiliaryIdentifier({ path: child.identifier.value })) {
                return true;
            }
        }
        return false;
    }
    /**
     * Deletes the given array of auxiliary identifiers.
     * Does not throw an error if something goes wrong.
     */
    async safelyDeleteAuxiliaryResources(identifiers) {
        const deletedResources = [];
        await Promise.all(identifiers.map(async (identifier) => {
            try {
                await this.accessor.deleteResource(identifier);
                deletedResources.push(identifier);
            }
            catch (error) {
                if (!NotFoundHttpError_1.NotFoundHttpError.isInstance(error)) {
                    this.logger.error(`Error deleting auxiliary resource ${identifier.path}: ${ErrorUtil_1.createErrorMessage(error)}`);
                }
            }
        }));
        return deletedResources;
    }
    /**
     * Create containers starting from the root until the given identifier corresponds to an existing container.
     * Will throw errors if the identifier of the last existing "container" corresponds to an existing document.
     * @param container - Identifier of the container which will need to exist.
     */
    async createRecursiveContainers(container) {
        // Verify whether the container already exists
        try {
            const metadata = await this.getNormalizedMetadata(container);
            // See #480
            // Solid, §3.1: "If two URIs differ only in the trailing slash, and the server has associated a resource with
            // one of them, then the other URI MUST NOT correspond to another resource. Instead, the server MAY respond to
            // requests for the latter URI with a 301 redirect to the former."
            // https://solid.github.io/specification/protocol#uri-slash-semantics
            if (!PathUtil_1.isContainerPath(metadata.identifier.value)) {
                throw new ForbiddenHttpError_1.ForbiddenHttpError(`Creating container ${container.path} conflicts with an existing resource.`);
            }
            return [];
        }
        catch (error) {
            if (!NotFoundHttpError_1.NotFoundHttpError.isInstance(error)) {
                throw error;
            }
        }
        // Create the container, starting with its parent
        const ancestors = this.identifierStrategy.isRootContainer(container) ?
            [] :
            await this.createRecursiveContainers(this.identifierStrategy.getParentContainer(container));
        await this.writeData(container, new BasicRepresentation_1.BasicRepresentation([], container), true, false, false);
        return [...ancestors, ResourceStore_1.createModifiedResource(container, __1.ModificationType.created)];
    }
}
exports.DataAccessorBasedStore = DataAccessorBasedStore;
//# sourceMappingURL=DataAccessorBasedStore.js.map