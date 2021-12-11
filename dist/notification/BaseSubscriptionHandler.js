"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseSubscriptionHandler = void 0;
const ResourceStore_1 = require("../storage/ResourceStore");
class BaseSubscriptionHandler {
    async onResourcesChanged(resources, subscription) {
        resources.forEach((modified) => this.onHandler(modified.modificationType)(modified.resource, subscription));
    }
    onHandler(modificationType) {
        // eslint-disable-next-line default-case
        switch (modificationType) {
            case ResourceStore_1.ModificationType.created: return this.onResourceCreated;
            case ResourceStore_1.ModificationType.changed: return this.onResourceChanged;
            case ResourceStore_1.ModificationType.deleted: return this.onResourceDeleted;
        }
    }
}
exports.BaseSubscriptionHandler = BaseSubscriptionHandler;
//# sourceMappingURL=BaseSubscriptionHandler.js.map