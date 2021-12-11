"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebIdAdapterFactory = exports.WebIdAdapter = void 0;
const cross_fetch_1 = require("cross-fetch");
const LogUtil_1 = require("../../logging/LogUtil");
const ErrorUtil_1 = require("../../util/errors/ErrorUtil");
const FetchUtil_1 = require("../../util/FetchUtil");
const Vocabularies_1 = require("../../util/Vocabularies");
/* eslint-disable @typescript-eslint/naming-convention */
/**
 * This {@link Adapter} redirects the `find` call to its source adapter.
 * In case no client data was found in the source for the given WebId,
 * this class will do an HTTP GET request to that WebId.
 * If a valid `solid:oidcRegistration` triple is found there,
 * that data will be returned instead.
 */
class WebIdAdapter {
    constructor(name, source, converter) {
        this.logger = LogUtil_1.getLoggerFor(this);
        this.name = name;
        this.source = source;
        this.converter = converter;
    }
    async upsert(id, payload, expiresIn) {
        return this.source.upsert(id, payload, expiresIn);
    }
    async find(id) {
        let payload = await this.source.find(id);
        // No payload is stored for the given Client ID.
        // Try to see if valid client metadata is found at the given Client ID.
        // The oidc-provider library will check if the redirect_uri matches an entry in the list of redirect_uris,
        // so no extra checks are needed from our side.
        if (!payload && this.name === 'Client' && /^https?:\/\/.+/u.test(id)) {
            this.logger.debug(`Looking for payload data at ${id}`);
            // All checks based on https://solid.github.io/authentication-panel/solid-oidc/#clientids-webid
            if (!/^https:|^http:\/\/localhost(?::\d+)?(?:\/|$)/u.test(id)) {
                throw new Error(`SSL is required for client_id authentication unless working locally.`);
            }
            const response = await cross_fetch_1.fetch(id);
            if (response.status !== 200) {
                throw new Error(`Unable to access data at ${id}: ${await response.text()}`);
            }
            const data = await response.text();
            let json;
            try {
                json = JSON.parse(data);
                // We can only parse as simple JSON if the @context is correct
                if (json['@context'] !== 'https://www.w3.org/ns/solid/oidc-context.jsonld') {
                    throw new Error('Invalid context');
                }
            }
            catch (error) {
                json = undefined;
                this.logger.debug(`Found unexpected client WebID for ${id}: ${ErrorUtil_1.createErrorMessage(error)}`);
            }
            if (json) {
                // Need to make sure the document is about the id
                if (json.client_id !== id) {
                    throw new Error('The client registration `client_id` field must match the client WebID');
                }
                payload = json;
            }
            else {
                // Since the WebID does not match the default JSON-LD we try to interpret it as RDF
                payload = await this.parseRdfWebId(data, id, response);
            }
            // `token_endpoint_auth_method: 'none'` prevents oidc-provider from requiring a client_secret
            payload = { ...payload, token_endpoint_auth_method: 'none' };
        }
        // Will also be returned if no valid client data was found above
        return payload;
    }
    /**
     * Parses RDF data found at a client WebID.
     * @param data - Raw data from the WebID.
     * @param id - The actual WebID.
     * @param response - Response object from the request.
     */
    async parseRdfWebId(data, id, response) {
        const representation = await FetchUtil_1.fetchDataset(response, this.converter, data);
        // Find the valid redirect URIs
        const redirectUris = [];
        for await (const entry of representation.data) {
            const triple = entry;
            if (triple.predicate.equals(Vocabularies_1.OIDC.terms.redirect_uris)) {
                redirectUris.push(triple.object.value);
            }
        }
        return {
            client_id: id,
            redirect_uris: redirectUris,
        };
    }
    async findByUserCode(userCode) {
        return this.source.findByUserCode(userCode);
    }
    async findByUid(uid) {
        return this.source.findByUid(uid);
    }
    async destroy(id) {
        return this.source.destroy(id);
    }
    async revokeByGrantId(grantId) {
        return this.source.revokeByGrantId(grantId);
    }
    async consume(id) {
        return this.source.consume(id);
    }
}
exports.WebIdAdapter = WebIdAdapter;
class WebIdAdapterFactory {
    constructor(source, converter) {
        this.source = source;
        this.converter = converter;
    }
    createStorageAdapter(name) {
        return new WebIdAdapter(name, this.source.createStorageAdapter(name), this.converter);
    }
}
exports.WebIdAdapterFactory = WebIdAdapterFactory;
//# sourceMappingURL=WebIdAdapterFactory.js.map