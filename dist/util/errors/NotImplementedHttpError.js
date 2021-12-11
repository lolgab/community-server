"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotImplementedHttpError = void 0;
const HttpError_1 = require("./HttpError");
/**
 * The server either does not recognize the request method, or it lacks the ability to fulfil the request.
 * Usually this implies future availability (e.g., a new feature of a web-service API).
 */
class NotImplementedHttpError extends HttpError_1.HttpError {
    constructor(message, options) {
        super(501, 'NotImplementedHttpError', message, options);
    }
    static isInstance(error) {
        return HttpError_1.HttpError.isInstance(error) && error.statusCode === 501;
    }
}
exports.NotImplementedHttpError = NotImplementedHttpError;
//# sourceMappingURL=NotImplementedHttpError.js.map