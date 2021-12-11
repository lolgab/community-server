"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadRequestHttpError = void 0;
const HttpError_1 = require("./HttpError");
/**
 * An error thrown when incoming data is not supported.
 * Probably because an {@link AsyncHandler} returns false on the canHandle call.
 */
class BadRequestHttpError extends HttpError_1.HttpError {
    /**
     * Default message is 'The given input is not supported by the server configuration.'.
     * @param message - Optional, more specific, message.
     * @param options - Optional error options.
     */
    constructor(message, options) {
        super(400, 'BadRequestHttpError', message !== null && message !== void 0 ? message : 'The given input is not supported by the server configuration.', options);
    }
    static isInstance(error) {
        return HttpError_1.HttpError.isInstance(error) && error.statusCode === 400;
    }
}
exports.BadRequestHttpError = BadRequestHttpError;
//# sourceMappingURL=BadRequestHttpError.js.map