import type { AuxiliaryIdentifierStrategy } from '../http/auxiliary/AuxiliaryIdentifierStrategy';
import type { AccountStore } from '../identity/interaction/email-password/storage/AccountStore';
import type { PermissionReaderInput } from './PermissionReader';
import { PermissionReader } from './PermissionReader';
import type { PermissionSet } from './permissions/Permissions';
/**
 * Allows control access if the request is being made by the owner of the pod containing the resource.
 */
export declare class OwnerPermissionReader extends PermissionReader {
    protected readonly logger: import("..").Logger;
    private readonly accountStore;
    private readonly aclStrategy;
    constructor(accountStore: AccountStore, aclStrategy: AuxiliaryIdentifierStrategy);
    handle(input: PermissionReaderInput): Promise<PermissionSet>;
    /**
     * Verify that all conditions are fulfilled to give the owner access.
     */
    private ensurePodOwner;
}
