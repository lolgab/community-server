"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepresentationConvertingStore = void 0;
const LogUtil_1 = require("../logging/LogUtil");
const PassthroughConverter_1 = require("./conversion/PassthroughConverter");
const PassthroughStore_1 = require("./PassthroughStore");
/**
 * Store that provides (optional) conversion of incoming and outgoing {@link Representation}s.
 */
class RepresentationConvertingStore extends PassthroughStore_1.PassthroughStore {
    /**
     * TODO: This should take RepresentationPreferences instead of a type string when supported by Components.js.
     */
    constructor(source, options) {
        super(source);
        this.logger = LogUtil_1.getLoggerFor(this);
        const { inConverter, outConverter, inType } = options;
        this.inConverter = inConverter !== null && inConverter !== void 0 ? inConverter : new PassthroughConverter_1.PassthroughConverter();
        this.outConverter = outConverter !== null && outConverter !== void 0 ? outConverter : new PassthroughConverter_1.PassthroughConverter();
        this.inPreferences = !inType ? {} : { type: { [inType]: 1 } };
    }
    async getRepresentation(identifier, preferences, conditions) {
        const representation = await super.getRepresentation(identifier, preferences, conditions);
        return this.outConverter.handleSafe({ identifier, representation, preferences });
    }
    async addResource(identifier, representation, conditions) {
        // We can potentially run into problems here if we convert a turtle document where the base IRI is required,
        // since we don't know the resource IRI yet at this point.
        representation = await this.inConverter.handleSafe({ identifier, representation, preferences: this.inPreferences });
        return this.source.addResource(identifier, representation, conditions);
    }
    async setRepresentation(identifier, representation, conditions) {
        representation = await this.inConverter.handleSafe({ identifier, representation, preferences: this.inPreferences });
        return this.source.setRepresentation(identifier, representation, conditions);
    }
}
exports.RepresentationConvertingStore = RepresentationConvertingStore;
//# sourceMappingURL=RepresentationConvertingStore.js.map