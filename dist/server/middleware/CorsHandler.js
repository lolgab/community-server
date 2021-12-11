"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorsHandler = void 0;
const cors_1 = __importDefault(require("cors"));
const HttpHandler_1 = require("../HttpHandler");
const defaultOptions = {
    origin: (origin, callback) => callback(null, origin !== null && origin !== void 0 ? origin : '*'),
};
/**
 * Handler that sets CORS options on the response.
 * In case of an OPTIONS request this handler will close the connection after adding its headers.
 *
 * Solid, §7.1: "A data pod MUST implement the CORS protocol [FETCH] such that, to the extent possible,
 * the browser allows Solid apps to send any request and combination of request headers to the data pod,
 * and the Solid app can read any response and response headers received from the data pod."
 * Full details: https://solid.github.io/specification/protocol#cors-server
 */
class CorsHandler extends HttpHandler_1.HttpHandler {
    constructor(options = {}) {
        super();
        this.corsHandler = cors_1.default({ ...defaultOptions, ...options });
    }
    async handle(input) {
        return new Promise((resolve) => {
            this.corsHandler(input.request, input.response, () => resolve());
        });
    }
}
exports.CorsHandler = CorsHandler;
//# sourceMappingURL=CorsHandler.js.map