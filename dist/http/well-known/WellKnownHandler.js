"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WellKnownHandler = void 0;
const HttpHandler_1 = require("../../server/HttpHandler");
class WellKnownHandler extends HttpHandler_1.HttpHandler {
    constructor(wellKnownBuilder) {
        super();
        this.wellKnownBuilder = wellKnownBuilder;
    }
    async handle(input) {
        const wellKnown = await this.wellKnownBuilder.getWellKnownSegment();
        input.response.setHeader('Content-Type', 'application/ld+json');
        input.response.write(JSON.stringify(wellKnown));
        input.response.end();
    }
}
exports.WellKnownHandler = WellKnownHandler;
//# sourceMappingURL=WellKnownHandler.js.map