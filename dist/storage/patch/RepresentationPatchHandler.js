"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepresentationPatchHandler = void 0;
const LogUtil_1 = require("../../logging/LogUtil");
const NotFoundHttpError_1 = require("../../util/errors/NotFoundHttpError");
const PatchHandler_1 = require("./PatchHandler");
/**
 * Handles a patch operation by getting the representation from the store, applying a `RepresentationPatcher`,
 * and then writing the result back to the store.
 *
 * In case there is no original representation (the store throws a `NotFoundHttpError`),
 * the patcher is expected to create a new one.
 */
class RepresentationPatchHandler extends PatchHandler_1.PatchHandler {
    constructor(patcher) {
        super();
        this.logger = LogUtil_1.getLoggerFor(this);
        this.patcher = patcher;
    }
    async handle({ source, patch, identifier }) {
        // Get the representation from the store
        let representation;
        try {
            representation = await source.getRepresentation(identifier, {});
        }
        catch (error) {
            // Solid, §5.1: "When a successful PUT or PATCH request creates a resource,
            // the server MUST use the effective request URI to assign the URI to that resource."
            // https://solid.github.io/specification/protocol#resource-type-heuristics
            if (!NotFoundHttpError_1.NotFoundHttpError.isInstance(error)) {
                throw error;
            }
            this.logger.debug(`Patching new resource ${identifier.path}`);
        }
        // Patch it
        const patched = await this.patcher.handleSafe({ patch, identifier, representation });
        // Write it back to the store
        return source.setRepresentation(identifier, patched);
    }
}
exports.RepresentationPatchHandler = RepresentationPatchHandler;
//# sourceMappingURL=RepresentationPatchHandler.js.map