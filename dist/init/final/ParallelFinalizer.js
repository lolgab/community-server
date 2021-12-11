"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParallelFinalizer = void 0;
/**
 * Finalizes all the injected Finalizable classes in parallel.
 */
class ParallelFinalizer {
    constructor(finalizers = []) {
        this.finalizers = finalizers;
    }
    async finalize() {
        await Promise.all(this.finalizers.map(async (finalizer) => finalizer.finalize()));
    }
}
exports.ParallelFinalizer = ParallelFinalizer;
//# sourceMappingURL=ParallelFinalizer.js.map