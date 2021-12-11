"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isHttpResponse = void 0;
/**
 * Checks if the given stream is an HttpResponse.
 */
function isHttpResponse(stream) {
    return typeof stream.socket === 'object' && typeof stream.url === 'string' && typeof stream.method === 'string';
}
exports.isHttpResponse = isHttpResponse;
//# sourceMappingURL=HttpResponse.js.map