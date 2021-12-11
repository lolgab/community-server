"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PutOperationHandler = void 0;
const LogUtil_1 = require("../../logging/LogUtil");
const BadRequestHttpError_1 = require("../../util/errors/BadRequestHttpError");
const NotImplementedHttpError_1 = require("../../util/errors/NotImplementedHttpError");
const CreatedResponseDescription_1 = require("../output/response/CreatedResponseDescription");
const ResetResponseDescription_1 = require("../output/response/ResetResponseDescription");
const OperationHandler_1 = require("./OperationHandler");
/**
 * Handles PUT {@link Operation}s.
 * Calls the setRepresentation function from a {@link ResourceStore}.
 */
class PutOperationHandler extends OperationHandler_1.OperationHandler {
    constructor(store) {
        super();
        this.logger = LogUtil_1.getLoggerFor(this);
        this.store = store;
    }
    async canHandle({ operation }) {
        if (operation.method !== 'PUT') {
            throw new NotImplementedHttpError_1.NotImplementedHttpError('This handler only supports PUT operations');
        }
    }
    async handle({ operation }) {
        // Solid, §2.1: "A Solid server MUST reject PUT, POST and PATCH requests
        // without the Content-Type header with a status code of 400."
        // https://solid.github.io/specification/protocol#http-server
        if (!operation.body.metadata.contentType) {
            this.logger.warn('PUT requests require the Content-Type header to be set');
            throw new BadRequestHttpError_1.BadRequestHttpError('PUT requests require the Content-Type header to be set');
        }
        // A more efficient approach would be to have the server return metadata indicating if a resource was new
        // See https://github.com/solid/community-server/issues/632
        const exists = await this.store.resourceExists(operation.target, operation.conditions);
        await this.store.setRepresentation(operation.target, operation.body, operation.conditions);
        if (exists) {
            return new ResetResponseDescription_1.ResetResponseDescription();
        }
        return new CreatedResponseDescription_1.CreatedResponseDescription(operation.target);
    }
}
exports.PutOperationHandler = PutOperationHandler;
//# sourceMappingURL=PutOperationHandler.js.map