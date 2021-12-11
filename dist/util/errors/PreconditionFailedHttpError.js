"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreconditionFailedHttpError = void 0;
const HttpError_1 = require("./HttpError");
/**
 * An error thrown when access was denied due to the conditions on the request.
 */
class PreconditionFailedHttpError extends HttpError_1.HttpError {
    constructor(message, options) {
        super(412, 'PreconditionFailedHttpError', message, options);
    }
    static isInstance(error) {
        return HttpError_1.HttpError.isInstance(error) && error.statusCode === 412;
    }
}
exports.PreconditionFailedHttpError = PreconditionFailedHttpError;
//# sourceMappingURL=PreconditionFailedHttpError.js.map