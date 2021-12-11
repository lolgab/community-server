"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsingHttpHandler = void 0;
const LogUtil_1 = require("../logging/LogUtil");
const ErrorUtil_1 = require("../util/errors/ErrorUtil");
const HttpHandler_1 = require("./HttpHandler");
/**
 * Parses requests and sends the resulting Operation to wrapped operationHandler.
 * Errors are caught and handled by the Errorhandler.
 * In case the operationHandler returns a result it will be sent to the ResponseWriter.
 */
class ParsingHttpHandler extends HttpHandler_1.HttpHandler {
    constructor(args) {
        super();
        this.logger = LogUtil_1.getLoggerFor(this);
        this.requestParser = args.requestParser;
        this.errorHandler = args.errorHandler;
        this.responseWriter = args.responseWriter;
        this.metadataCollector = args.metadataCollector;
        this.operationHandler = args.operationHandler;
    }
    async handle({ request, response }) {
        let result;
        let preferences = { type: { 'text/plain': 1 } };
        try {
            const operation = await this.requestParser.handleSafe(request);
            ({ preferences } = operation);
            result = await this.operationHandler.handleSafe({ operation, request, response });
            if (result === null || result === void 0 ? void 0 : result.metadata) {
                await this.metadataCollector.handleSafe({ operation, metadata: result.metadata });
            }
            this.logger.verbose(`Parsed ${operation.method} operation on ${operation.target.path}`);
        }
        catch (error) {
            ErrorUtil_1.assertError(error);
            result = await this.errorHandler.handleSafe({ error, preferences });
        }
        if (result) {
            await this.responseWriter.handleSafe({ response, result });
        }
    }
}
exports.ParsingHttpHandler = ParsingHttpHandler;
//# sourceMappingURL=ParsingHttpHandler.js.map