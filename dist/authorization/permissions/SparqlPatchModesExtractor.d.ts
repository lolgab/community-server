import type { Operation } from '../../http/Operation';
import { ModesExtractor } from './ModesExtractor';
import { AccessMode } from './Permissions';
export declare class SparqlPatchModesExtractor extends ModesExtractor {
    canHandle({ method, body }: Operation): Promise<void>;
    handle({ body }: Operation): Promise<Set<AccessMode>>;
    private isSparql;
    private isSupported;
    private isDeleteInsert;
    private isNop;
    private needsAppend;
    private needsWrite;
}
