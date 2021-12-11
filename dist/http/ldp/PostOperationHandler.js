"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostOperationHandler = void 0;
const LogUtil_1 = require("../../logging/LogUtil");
const BadRequestHttpError_1 = require("../../util/errors/BadRequestHttpError");
const NotImplementedHttpError_1 = require("../../util/errors/NotImplementedHttpError");
const CreatedResponseDescription_1 = require("../output/response/CreatedResponseDescription");
const OperationHandler_1 = require("./OperationHandler");
/**
 * Handles POST {@link Operation}s.
 * Calls the addResource function from a {@link ResourceStore}.
 */
class PostOperationHandler extends OperationHandler_1.OperationHandler {
    constructor(store) {
        super();
        this.logger = LogUtil_1.getLoggerFor(this);
        this.store = store;
    }
    async canHandle({ operation }) {
        if (operation.method !== 'POST') {
            throw new NotImplementedHttpError_1.NotImplementedHttpError('This handler only supports POST operations');
        }
    }
    async handle({ operation }) {
        // Solid, §2.1: "A Solid server MUST reject PUT, POST and PATCH requests
        // without the Content-Type header with a status code of 400."
        // https://solid.github.io/specification/protocol#http-server
        if (!operation.body.metadata.contentType) {
            this.logger.warn('POST requests require the Content-Type header to be set');
            throw new BadRequestHttpError_1.BadRequestHttpError('POST requests require the Content-Type header to be set');
        }
        const modified = await this.store.addResource(operation.target, operation.body, operation.conditions);
        return new CreatedResponseDescription_1.CreatedResponseDescription(modified.resource);
    }
}
exports.PostOperationHandler = PostOperationHandler;
//# sourceMappingURL=PostOperationHandler.js.map