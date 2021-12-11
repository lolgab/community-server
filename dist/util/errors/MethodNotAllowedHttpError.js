"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MethodNotAllowedHttpError = void 0;
const HttpError_1 = require("./HttpError");
/**
 * An error thrown when data was found for the requested identifier, but is not supported by the target resource.
 */
class MethodNotAllowedHttpError extends HttpError_1.HttpError {
    constructor(message, options) {
        super(405, 'MethodNotAllowedHttpError', message, options);
    }
    static isInstance(error) {
        return HttpError_1.HttpError.isInstance(error) && error.statusCode === 405;
    }
}
exports.MethodNotAllowedHttpError = MethodNotAllowedHttpError;
//# sourceMappingURL=MethodNotAllowedHttpError.js.map