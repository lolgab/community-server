"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedirectAllHttpHandler = void 0;
const RedirectResponseDescription_1 = require("../../http/output/response/RedirectResponseDescription");
const NotImplementedHttpError_1 = require("../../util/errors/NotImplementedHttpError");
const PathUtil_1 = require("../../util/PathUtil");
const HttpHandler_1 = require("../HttpHandler");
/**
 * Will redirect all incoming requests to the given target.
 * In case the incoming request already has the correct target,
 * the `canHandle` call will reject the input.
 */
class RedirectAllHttpHandler extends HttpHandler_1.HttpHandler {
    constructor(args) {
        super();
        this.baseUrl = args.baseUrl;
        this.target = args.target;
        this.targetExtractor = args.targetExtractor;
        this.responseWriter = args.responseWriter;
    }
    async canHandle({ request }) {
        const target = await PathUtil_1.getRelativeUrl(this.baseUrl, request, this.targetExtractor);
        if (target === this.target) {
            throw new NotImplementedHttpError_1.NotImplementedHttpError('Target is already correct.');
        }
    }
    async handle({ response }) {
        const result = new RedirectResponseDescription_1.RedirectResponseDescription(PathUtil_1.joinUrl(this.baseUrl, this.target));
        await this.responseWriter.handleSafe({ response, result });
    }
}
exports.RedirectAllHttpHandler = RedirectAllHttpHandler;
//# sourceMappingURL=RedirectAllHttpHandler.js.map