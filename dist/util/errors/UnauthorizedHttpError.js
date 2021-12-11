"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedHttpError = void 0;
const HttpError_1 = require("./HttpError");
/**
 * An error thrown when an agent is not authorized.
 */
class UnauthorizedHttpError extends HttpError_1.HttpError {
    constructor(message, options) {
        super(401, 'UnauthorizedHttpError', message, options);
    }
    static isInstance(error) {
        return HttpError_1.HttpError.isInstance(error) && error.statusCode === 401;
    }
}
exports.UnauthorizedHttpError = UnauthorizedHttpError;
//# sourceMappingURL=UnauthorizedHttpError.js.map