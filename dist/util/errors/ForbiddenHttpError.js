"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenHttpError = void 0;
const HttpError_1 = require("./HttpError");
/**
 * An error thrown when an agent is not allowed to access data.
 */
class ForbiddenHttpError extends HttpError_1.HttpError {
    constructor(message, options) {
        super(403, 'ForbiddenHttpError', message, options);
    }
    static isInstance(error) {
        return HttpError_1.HttpError.isInstance(error) && error.statusCode === 403;
    }
}
exports.ForbiddenHttpError = ForbiddenHttpError;
//# sourceMappingURL=ForbiddenHttpError.js.map