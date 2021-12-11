import type { Operation } from '../../http/Operation';
import { AsyncHandler } from '../../util/handlers/AsyncHandler';
import type { AccessMode } from './Permissions';
export declare abstract class ModesExtractor extends AsyncHandler<Operation, Set<AccessMode>> {
}
