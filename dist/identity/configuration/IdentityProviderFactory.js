"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityProviderFactory = void 0;
/* eslint-disable @typescript-eslint/naming-convention, tsdoc/syntax */
// tsdoc/syntax can't handle {json} parameter
const crypto_1 = require("crypto");
const oidc_provider_1 = require("oidc-provider");
const PathUtil_1 = require("../../util/PathUtil");
const JWKS_KEY = 'jwks';
const COOKIES_KEY = 'cookie-secret';
/**
 * Creates an OIDC Provider based on the provided configuration and parameters.
 * The provider will be cached and returned on subsequent calls.
 * Cookie and JWT keys will be stored in an internal storage so they can be re-used over multiple threads.
 * Necessary claims for Solid OIDC interactions will be added.
 * Routes will be updated based on the `baseUrl` and `idpPath`.
 */
class IdentityProviderFactory {
    /**
     * @param config - JSON config for the OIDC library @range {json}
     * @param args - Remaining parameters required for the factory.
     */
    constructor(config, args) {
        if (!args.idpPath.startsWith('/')) {
            throw new Error('idpPath needs to start with a /');
        }
        this.config = config;
        Object.assign(this, args);
    }
    async getProvider() {
        if (this.provider) {
            return this.provider;
        }
        this.provider = await this.createProvider();
        return this.provider;
    }
    /**
     * Creates a Provider by building a Configuration using all the stored parameters.
     */
    async createProvider() {
        const config = await this.initConfig();
        // Add correct claims to IdToken/AccessToken responses
        this.configureClaims(config);
        // Make sure routes are contained in the IDP space
        this.configureRoutes(config);
        // Render errors with our own error handler
        this.configureErrors(config);
        // Allow provider to interpret reverse proxy headers
        const provider = new oidc_provider_1.Provider(this.baseUrl, config);
        provider.proxy = true;
        return provider;
    }
    /**
     * Creates a configuration by copying the internal configuration
     * and adding the adapter, default audience and jwks/cookie keys.
     */
    async initConfig() {
        var _a;
        // Create a deep copy
        const config = JSON.parse(JSON.stringify(this.config));
        // Indicates which Adapter should be used for storing oidc data
        // The adapter function MUST be a named function.
        // See https://github.com/panva/node-oidc-provider/issues/799
        const factory = this.adapterFactory;
        config.adapter = function loadAdapter(name) {
            return factory.createStorageAdapter(name);
        };
        // Cast necessary due to typing conflict between jose 2.x and 3.x
        config.jwks = await this.jwksKeyGenerator.getPrivateJwks(JWKS_KEY);
        config.cookies = {
            ...(_a = config.cookies) !== null && _a !== void 0 ? _a : {},
            keys: await this.generateCookieKeys(),
        };
        return config;
    }
    /**
     * Generates a cookie secret to be used for cookie signing.
     * The key will be cached so subsequent calls return the same key.
     */
    async generateCookieKeys() {
        // Check to see if the keys are already saved
        const cookieSecret = await this.storage.get(COOKIES_KEY);
        if (Array.isArray(cookieSecret)) {
            return cookieSecret;
        }
        // If they are not, generate and save them
        const newCookieSecret = [crypto_1.randomBytes(64).toString('hex')];
        await this.storage.set(COOKIES_KEY, newCookieSecret);
        return newCookieSecret;
    }
    /**
     * Checks if the given token is an access token.
     * The AccessToken interface is not exported so we have to access it like this.
     */
    isAccessToken(token) {
        return token.kind === 'AccessToken';
    }
    /**
     * Adds the necessary claims the to id token and access token based on the Solid OIDC spec.
     */
    configureClaims(config) {
        // Access token audience is 'solid', ID token audience is the client_id
        config.audiences = (ctx, sub, token, use) => use === 'access_token' ? 'solid' : token.clientId;
        // Returns the id_token
        // See https://solid.github.io/authentication-panel/solid-oidc/#tokens-id
        config.findAccount = async (ctx, sub) => ({
            accountId: sub,
            claims: async () => ({ sub, webid: sub }),
        });
        // Add extra claims in case an AccessToken is being issued.
        // Specifically this sets the required webid and client_id claims for the access token
        // See https://solid.github.io/authentication-panel/solid-oidc/#tokens-access
        config.extraAccessTokenClaims = (ctx, token) => this.isAccessToken(token) ?
            { webid: token.accountId, client_id: token.clientId } :
            {};
    }
    /**
     * Creates the route string as required by the `oidc-provider` library.
     * In case base URL is `http://test.com/foo/`, `idpPath` is `/idp` and `relative` is `device/auth`,
     * this would result in `/foo/idp/device/auth`.
     */
    createRoute(relative) {
        return new URL(PathUtil_1.joinUrl(this.baseUrl, this.idpPath, relative)).pathname;
    }
    /**
     * Sets up all the IDP routes relative to the IDP path.
     */
    configureRoutes(config) {
        // When oidc-provider cannot fulfill the authorization request for any of the possible reasons
        // (missing user session, requested ACR not fulfilled, prompt requested, ...)
        // it will resolve the interactions.url helper function and redirect the User-Agent to that url.
        config.interactions = {
            url: () => PathUtil_1.ensureTrailingSlash(this.idpPath),
        };
        config.routes = {
            authorization: this.createRoute('auth'),
            check_session: this.createRoute('session/check'),
            code_verification: this.createRoute('device'),
            device_authorization: this.createRoute('device/auth'),
            end_session: this.createRoute('session/end'),
            introspection: this.createRoute('token/introspection'),
            jwks: this.createRoute('jwks'),
            pushed_authorization_request: this.createRoute('request'),
            registration: this.createRoute('reg'),
            revocation: this.createRoute('token/revocation'),
            token: this.createRoute('token'),
            userinfo: this.createRoute('me'),
        };
    }
    /**
     * Pipes library errors to the provided ErrorHandler and ResponseWriter.
     */
    configureErrors(config) {
        config.renderError = async (ctx, out, error) => {
            // This allows us to stream directly to to the response object, see https://github.com/koajs/koa/issues/944
            ctx.respond = false;
            const result = await this.errorHandler.handleSafe({ error, preferences: { type: { 'text/plain': 1 } } });
            await this.responseWriter.handleSafe({ response: ctx.res, result });
        };
    }
}
exports.IdentityProviderFactory = IdentityProviderFactory;
//# sourceMappingURL=IdentityProviderFactory.js.map