"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringStore = void 0;
const events_1 = require("events");
const ResourceStore_1 = require("./ResourceStore");
/**
 * Store that notifies listeners of changes to its source
 * by emitting a `modified` event.
 */
class MonitoringStore extends events_1.EventEmitter {
    constructor(source) {
        super();
        this.source = source;
    }
    async resourceExists(identifier, conditions) {
        return this.source.resourceExists(identifier, conditions);
    }
    async getRepresentation(identifier, preferences, conditions) {
        return this.source.getRepresentation(identifier, preferences, conditions);
    }
    async addResource(container, representation, conditions) {
        const identifier = await this.source.addResource(container, representation, conditions);
        this.emitChanged([ResourceStore_1.createModifiedResource(container, ResourceStore_1.ModificationType.changed), identifier]);
        return identifier;
    }
    async deleteResource(identifier, conditions) {
        return this.emitChanged(await this.source.deleteResource(identifier, conditions));
    }
    async setRepresentation(identifier, representation, conditions) {
        return this.emitChanged(await this.source.setRepresentation(identifier, representation, conditions));
    }
    async modifyResource(identifier, patch, conditions) {
        return this.emitChanged(await this.source.modifyResource(identifier, patch, conditions));
    }
    emitChanged(modified) {
        // Don't emit 'changed' event for internal resources
        if (!this.isInternalResource(modified)) {
            this.emit('changed', modified);
        }
        return modified;
    }
    isInternalResource(result) {
        return result.some((modified) => modified.resource.path.includes('/.internal'));
    }
}
exports.MonitoringStore = MonitoringStore;
//# sourceMappingURL=MonitoringStore.js.map