"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnsupportedMediaTypeHttpError = void 0;
const HttpError_1 = require("./HttpError");
/**
 * An error thrown when the media type of incoming data is not supported by a parser.
 */
class UnsupportedMediaTypeHttpError extends HttpError_1.HttpError {
    constructor(message, options) {
        super(415, 'UnsupportedMediaTypeHttpError', message, options);
    }
    static isInstance(error) {
        return HttpError_1.HttpError.isInstance(error) && error.statusCode === 415;
    }
}
exports.UnsupportedMediaTypeHttpError = UnsupportedMediaTypeHttpError;
//# sourceMappingURL=UnsupportedMediaTypeHttpError.js.map