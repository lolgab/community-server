"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundHttpError = void 0;
const HttpError_1 = require("./HttpError");
/**
 * An error thrown when no data was found for the requested identifier.
 */
class NotFoundHttpError extends HttpError_1.HttpError {
    constructor(message, options) {
        super(404, 'NotFoundHttpError', message, options);
    }
    static isInstance(error) {
        return HttpError_1.HttpError.isInstance(error) && error.statusCode === 404;
    }
}
exports.NotFoundHttpError = NotFoundHttpError;
//# sourceMappingURL=NotFoundHttpError.js.map