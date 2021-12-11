import type { AuxiliaryIdentifierStrategy } from '../http/auxiliary/AuxiliaryIdentifierStrategy';
import type { ResourceStore } from '../storage/ResourceStore';
import type { IdentifierStrategy } from '../util/identifiers/IdentifierStrategy';
import type { AccessChecker } from './access/AccessChecker';
import type { PermissionReaderInput } from './PermissionReader';
import { PermissionReader } from './PermissionReader';
import type { PermissionSet } from './permissions/Permissions';
/**
 * Handles permissions according to the WAC specification.
 * Specific access checks are done by the provided {@link AccessChecker}.
 */
export declare class WebAclReader extends PermissionReader {
    protected readonly logger: import("..").Logger;
    private readonly aclStrategy;
    private readonly aclStore;
    private readonly identifierStrategy;
    private readonly accessChecker;
    constructor(aclStrategy: AuxiliaryIdentifierStrategy, aclStore: ResourceStore, identifierStrategy: IdentifierStrategy, accessChecker: AccessChecker);
    /**
     * Checks if an agent is allowed to execute the requested actions.
     * Will throw an error if this is not the case.
     * @param input - Relevant data needed to check if access can be granted.
     */
    handle({ identifier, credentials }: PermissionReaderInput): Promise<PermissionSet>;
    /**
     * Creates an Authorization object based on the quads found in the ACL.
     * @param credentials - Credentials to check permissions for.
     * @param acl - Store containing all relevant authorization triples.
     * @param isAcl - If the target resource is an acl document.
     */
    private createPermissions;
    /**
     * Determines the available permissions for the given credentials.
     * Will deny all permissions if credentials are not defined
     * @param acl - Store containing all relevant authorization triples.
     * @param credentials - Credentials to find the permissions for.
     */
    private determinePermissions;
    /**
     * Sets the correct values for non-acl permissions such as create and delete.
     * Also adds the correct values to indicate that having control permission
     * implies having read/write/etc. on the acl resource.
     *
     * The main reason for keeping the control value is so we can correctly set the WAC-Allow header later.
     */
    private updateAclPermissions;
    /**
     * Returns the ACL triples that are relevant for the given identifier.
     * These can either be from a corresponding ACL document or an ACL document higher up with defaults.
     * Rethrows any non-NotFoundHttpErrors thrown by the ResourceStore.
     * @param id - ResourceIdentifier of which we need the ACL triples.
     * @param recurse - Only used internally for recursion.
     *
     * @returns A store containing the relevant ACL triples.
     */
    private getAclRecursive;
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
    private filterData;
}
