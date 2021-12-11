import type { Representation } from '../../http/representation/Representation';
import type { RepresentationPatcherInput } from './RepresentationPatcher';
import { RepresentationPatcher } from './RepresentationPatcher';
/**
 * A `RepresentationPatcher` specifically for patching containers.
 * A new body will be constructed from the metadata by removing all generated metadata.
 * This body will be passed to the wrapped patcher.
 */
export declare class ContainerPatcher extends RepresentationPatcher {
    private readonly patcher;
    constructor(patcher: RepresentationPatcher);
    canHandle(input: RepresentationPatcherInput): Promise<void>;
    handle(input: RepresentationPatcherInput): Promise<Representation>;
}
