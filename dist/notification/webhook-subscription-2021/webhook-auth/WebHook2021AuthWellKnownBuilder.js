"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebHook2021AuthWellKnownBuilder = void 0;
const PathUtil_1 = require("../../../util/PathUtil");
class WebHook2021AuthWellKnownBuilder {
    constructor(args) {
        this.jwksEndpoint = PathUtil_1.trimTrailingSlashes(PathUtil_1.joinUrl(args.baseUrl, args.jwksEndpointPath));
    }
    async getWellKnownSegment() {
        return {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            jwks_endpoint: this.jwksEndpoint,
        };
    }
}
exports.WebHook2021AuthWellKnownBuilder = WebHook2021AuthWellKnownBuilder;
//# sourceMappingURL=WebHook2021AuthWellKnownBuilder.js.map