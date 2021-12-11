"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictHttpError = void 0;
const HttpError_1 = require("./HttpError");
/**
 * An error thrown when a request conflict with current state of the server.
 */
class ConflictHttpError extends HttpError_1.HttpError {
    constructor(message, options) {
        super(409, 'ConflictHttpError', message, options);
    }
    static isInstance(error) {
        return HttpError_1.HttpError.isInstance(error) && error.statusCode === 409;
    }
}
exports.ConflictHttpError = ConflictHttpError;
//# sourceMappingURL=ConflictHttpError.js.map