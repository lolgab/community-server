import type { PermissionReaderInput } from './PermissionReader';
import { PermissionReader } from './PermissionReader';
import type { PermissionSet } from './permissions/Permissions';
/**
 * PermissionReader which sets all permissions to true or false
 * independently of the identifier and requested permissions.
 */
export declare class AllStaticReader extends PermissionReader {
    private readonly permissions;
    constructor(allow: boolean);
    handle({ credentials }: PermissionReaderInput): Promise<PermissionSet>;
}
