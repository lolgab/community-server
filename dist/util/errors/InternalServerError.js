"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = void 0;
const HttpError_1 = require("./HttpError");
/**
 * A generic error message, given when an unexpected condition was encountered and no more specific message is suitable.
 */
class InternalServerError extends HttpError_1.HttpError {
    constructor(message, options) {
        super(500, 'InternalServerError', message, options);
    }
    static isInstance(error) {
        return HttpError_1.HttpError.isInstance(error) && error.statusCode === 500;
    }
}
exports.InternalServerError = InternalServerError;
//# sourceMappingURL=InternalServerError.js.map