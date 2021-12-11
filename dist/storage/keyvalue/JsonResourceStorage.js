"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonResourceStorage = void 0;
const url_1 = require("url");
const BasicRepresentation_1 = require("../../http/representation/BasicRepresentation");
const NotFoundHttpError_1 = require("../../util/errors/NotFoundHttpError");
const PathUtil_1 = require("../../util/PathUtil");
const StreamUtil_1 = require("../../util/StreamUtil");
const Vocabularies_1 = require("../../util/Vocabularies");
/**
 * A {@link KeyValueStorage} for JSON-like objects using a {@link ResourceStore} as backend.
 *
 * The keys will be transformed so they can be safely used
 * as a resource name in the given container.
 * Values will be sent as data streams,
 * so how these are stored depends on the underlying store.
 *
 * All non-404 errors will be re-thrown.
 */
class JsonResourceStorage {
    constructor(source, baseUrl, container) {
        this.source = source;
        this.container = PathUtil_1.ensureTrailingSlash(new url_1.URL(container, baseUrl).href);
    }
    async get(key) {
        try {
            const identifier = this.createIdentifier(key);
            const representation = await this.source.getRepresentation(identifier, { type: { 'application/json': 1 } });
            return JSON.parse(await StreamUtil_1.readableToString(representation.data));
        }
        catch (error) {
            if (!NotFoundHttpError_1.NotFoundHttpError.isInstance(error)) {
                throw error;
            }
        }
    }
    async has(key) {
        const identifier = this.createIdentifier(key);
        return await this.source.resourceExists(identifier);
    }
    async set(key, value) {
        const identifier = this.createIdentifier(key);
        const representation = new BasicRepresentation_1.BasicRepresentation(JSON.stringify(value), identifier, 'application/json');
        await this.source.setRepresentation(identifier, representation);
        return this;
    }
    async delete(key) {
        try {
            const identifier = this.createIdentifier(key);
            await this.source.deleteResource(identifier);
            return true;
        }
        catch (error) {
            if (!NotFoundHttpError_1.NotFoundHttpError.isInstance(error)) {
                throw error;
            }
            return false;
        }
    }
    async *entries() {
        // Getting ldp:contains metadata from container to find entries
        let container;
        try {
            container = await this.source.getRepresentation({ path: this.container }, {});
        }
        catch (error) {
            // Container might not exist yet, will be created the first time `set` gets called
            if (!NotFoundHttpError_1.NotFoundHttpError.isInstance(error)) {
                throw error;
            }
            return;
        }
        // Only need the metadata
        container.data.destroy();
        const members = container.metadata.getAll(Vocabularies_1.LDP.terms.contains).map((term) => term.value);
        for (const member of members) {
            const representation = await this.source.getRepresentation({ path: member }, { type: { 'application/json': 1 } });
            const json = JSON.parse(await StreamUtil_1.readableToString(representation.data));
            yield [this.parseMember(member), json];
        }
    }
    /**
     * Converts a key into an identifier for internal storage.
     */
    createIdentifier(key) {
        const buffer = Buffer.from(key);
        return { path: `${this.container}${buffer.toString('base64')}` };
    }
    /**
     * Converts an internal storage identifier string into the original identifier key.
     */
    parseMember(member) {
        const buffer = Buffer.from(member.slice(this.container.length), 'base64');
        return buffer.toString('utf-8');
    }
}
exports.JsonResourceStorage = JsonResourceStorage;
//# sourceMappingURL=JsonResourceStorage.js.map