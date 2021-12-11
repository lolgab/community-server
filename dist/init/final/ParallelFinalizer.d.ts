import type { Finalizable } from './Finalizable';
/**
 * Finalizes all the injected Finalizable classes in parallel.
 */
export declare class ParallelFinalizer implements Finalizable {
    private readonly finalizers;
    constructor(finalizers?: Finalizable[]);
    finalize(): Promise<void>;
}
