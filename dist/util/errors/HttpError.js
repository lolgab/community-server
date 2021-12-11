"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpError = void 0;
const ErrorUtil_1 = require("./ErrorUtil");
/**
 * A class for all errors that could be thrown by Solid.
 * All errors inheriting from this should fix the status code thereby hiding the HTTP internals from other components.
 */
class HttpError extends Error {
    /**
     * Creates a new HTTP error. Subclasses should call this with their fixed status code.
     * @param statusCode - HTTP status code needed for the HTTP response.
     * @param name - Error name. Useful for logging and stack tracing.
     * @param message - Error message.
     * @param options - Optional options.
     */
    constructor(statusCode, name, message, options = {}) {
        var _a;
        super(message);
        this.statusCode = statusCode;
        this.name = name;
        this.cause = options.cause;
        this.errorCode = (_a = options.errorCode) !== null && _a !== void 0 ? _a : `H${statusCode}`;
        this.details = options.details;
    }
    static isInstance(error) {
        return ErrorUtil_1.isError(error) && typeof error.statusCode === 'number';
    }
}
exports.HttpError = HttpError;
//# sourceMappingURL=HttpError.js.map