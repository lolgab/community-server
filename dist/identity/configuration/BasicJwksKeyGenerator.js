"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicJwksKeyGenerator = void 0;
/* eslint-disable import/no-unresolved */
// import/no-unresolved can't handle jose imports
const from_key_like_1 = require("jose/jwk/from_key_like");
const generate_key_pair_1 = require("jose/util/generate_key_pair");
class BasicJwksKeyGenerator {
    constructor(args) {
        this.storage = args.storage;
    }
    /**
     * Generates a JWKS using a single RS256 JWK..
     * The JWKS will be cached so subsequent calls return the same key.
     */
    async getPrivateJwks(keyName) {
        // Check to see if the keys are already saved
        const jwks = await this.storage.get(`${keyName}:private`);
        if (jwks) {
            return jwks;
        }
        return (await this.generateAndSaveKeys(keyName)).private;
    }
    async getPublicJwks(keyName) {
        const jwks = await this.storage.get(`${keyName}:public`);
        if (jwks) {
            return jwks;
        }
        return (await this.generateAndSaveKeys(keyName)).public;
    }
    async generateAndSaveKeys(keyName) {
        // If they are not, generate and save them
        const { privateKey, publicKey } = await generate_key_pair_1.generateKeyPair('RS256');
        const jwkPrivate = await from_key_like_1.fromKeyLike(privateKey);
        const jwkPublic = await from_key_like_1.fromKeyLike(publicKey);
        // Required for Solid authn client
        jwkPrivate.alg = 'RS256';
        jwkPublic.alg = 'RS256';
        // In node v15.12.0 the JWKS does not get accepted because the JWK is not a plain object,
        // which is why we convert it into a plain object here.
        // Potentially this can be changed at a later point in time to `{ keys: [ jwk ]}`.
        const newPrivateJwks = { keys: [{ ...jwkPrivate }] };
        const newPublicJwks = { keys: [{ ...jwkPublic }] };
        await this.storage.set(`${keyName}:private`, newPrivateJwks);
        await this.storage.set(`${keyName}:public`, newPublicJwks);
        return { public: newPublicJwks, private: newPrivateJwks };
    }
}
exports.BasicJwksKeyGenerator = BasicJwksKeyGenerator;
//# sourceMappingURL=BasicJwksKeyGenerator.js.map