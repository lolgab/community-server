import type { CredentialGroup } from '../../authentication/Credentials';
/**
 * Different modes that require permission.
 */
export declare enum AccessMode {
    read = "read",
    append = "append",
    write = "write",
    create = "create",
    delete = "delete"
}
/**
 * A data interface indicating which permissions are required (based on the context).
 */
export declare type Permission = Partial<Record<AccessMode, boolean>>;
export declare type PermissionSet = Partial<Record<CredentialGroup, Permission>>;
