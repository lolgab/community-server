import type { AuxiliaryStrategy } from '../http/auxiliary/AuxiliaryStrategy';
import type { PermissionReaderInput } from './PermissionReader';
import { PermissionReader } from './PermissionReader';
import type { PermissionSet } from './permissions/Permissions';
/**
 * A PermissionReader for auxiliary resources such as acl or shape resources.
 * By default, the access permissions of an auxiliary resource depend on those of its subject resource.
 * This authorizer calls the source authorizer with the identifier of the subject resource.
 */
export declare class AuxiliaryReader extends PermissionReader {
    protected readonly logger: import("..").Logger;
    private readonly resourceReader;
    private readonly auxiliaryStrategy;
    constructor(resourceReader: PermissionReader, auxiliaryStrategy: AuxiliaryStrategy);
    canHandle(auxiliaryAuth: PermissionReaderInput): Promise<void>;
    handle(auxiliaryAuth: PermissionReaderInput): Promise<PermissionSet>;
    handleSafe(auxiliaryAuth: PermissionReaderInput): Promise<PermissionSet>;
    private getRequiredAuthorization;
}
