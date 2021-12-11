import type { Operation } from '../../http/Operation';
import { ModesExtractor } from './ModesExtractor';
import { AccessMode } from './Permissions';
/**
 * Generates permissions for the base set of methods that always require the same permissions.
 * Specifically: GET, HEAD, POST, PUT and DELETE.
 */
export declare class MethodModesExtractor extends ModesExtractor {
    canHandle({ method }: Operation): Promise<void>;
    handle({ method }: Operation): Promise<Set<AccessMode>>;
}
