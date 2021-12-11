"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PodJwksHttpHandler = exports.POD_JWKS_KEY = void 0;
const HttpHandler_1 = require("../../../server/HttpHandler");
exports.POD_JWKS_KEY = 'POD_JWKS';
class PodJwksHttpHandler extends HttpHandler_1.HttpHandler {
    constructor(args) {
        super();
        this.jwksKeyGenerator = args.jwksKeyGenerator;
    }
    async handle(input) {
        const jwksPublic = await this.jwksKeyGenerator.getPublicJwks(exports.POD_JWKS_KEY);
        input.response.setHeader('Content-Type', 'application/ld+json');
        input.response.write(JSON.stringify(jwksPublic));
        input.response.end();
    }
}
exports.PodJwksHttpHandler = PodJwksHttpHandler;
//# sourceMappingURL=PodJwksHttpHandler.js.map