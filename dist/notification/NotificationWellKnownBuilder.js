"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationWellKnownBuilder = void 0;
const PathUtil_1 = require("../util/PathUtil");
class NotificationWellKnownBuilder {
    constructor(args) {
        this.notificationEndpoint = PathUtil_1.trimTrailingSlashes(PathUtil_1.joinUrl(args.baseUrl, args.notificationEndpointPath));
    }
    async getWellKnownSegment() {
        return {
            '@context': ['https://www.w3.org/ns/solid/notification/v1'],
            // eslint-disable-next-line @typescript-eslint/naming-convention
            notification_endpoint: this.notificationEndpoint,
        };
    }
}
exports.NotificationWellKnownBuilder = NotificationWellKnownBuilder;
//# sourceMappingURL=NotificationWellKnownBuilder.js.map