import type { Configuration } from 'oidc-provider';
import { Provider } from 'oidc-provider';
import type { ErrorHandler } from '../../http/output/error/ErrorHandler';
import type { ResponseWriter } from '../../http/output/ResponseWriter';
import type { KeyValueStorage } from '../../storage/keyvalue/KeyValueStorage';
import type { AdapterFactory } from '../storage/AdapterFactory';
import type { JwksKeyGenerator } from './JwksKeyGenerator';
import type { ProviderFactory } from './ProviderFactory';
export interface IdentityProviderFactoryArgs {
    /**
     * Factory that creates the adapter used for OIDC data storage.
     */
    adapterFactory: AdapterFactory;
    /**
     * Base URL of the server.
     */
    baseUrl: string;
    /**
     * Path of the IDP component in the server.
     * Should start with a slash.
     */
    idpPath: string;
    /**
     * Storage used to store cookie and JWT keys so they can be re-used in case of multithreading.
     */
    storage: KeyValueStorage<string, unknown>;
    /**
     * Used to convert errors thrown by the OIDC library.
     */
    errorHandler: ErrorHandler;
    /**
     * Used to write out errors thrown by the OIDC library.
     */
    responseWriter: ResponseWriter;
    /**
     * Used to generate and store JWKS
     */
    jwksKeyGenerator: JwksKeyGenerator;
}
/**
 * Creates an OIDC Provider based on the provided configuration and parameters.
 * The provider will be cached and returned on subsequent calls.
 * Cookie and JWT keys will be stored in an internal storage so they can be re-used over multiple threads.
 * Necessary claims for Solid OIDC interactions will be added.
 * Routes will be updated based on the `baseUrl` and `idpPath`.
 */
export declare class IdentityProviderFactory implements ProviderFactory {
    private readonly config;
    private readonly adapterFactory;
    private readonly baseUrl;
    private readonly idpPath;
    private readonly storage;
    private readonly errorHandler;
    private readonly responseWriter;
    private readonly jwksKeyGenerator;
    private provider?;
    /**
     * @param config - JSON config for the OIDC library @range {json}
     * @param args - Remaining parameters required for the factory.
     */
    constructor(config: Configuration, args: IdentityProviderFactoryArgs);
    getProvider(): Promise<Provider>;
    /**
     * Creates a Provider by building a Configuration using all the stored parameters.
     */
    private createProvider;
    /**
     * Creates a configuration by copying the internal configuration
     * and adding the adapter, default audience and jwks/cookie keys.
     */
    private initConfig;
    /**
     * Generates a cookie secret to be used for cookie signing.
     * The key will be cached so subsequent calls return the same key.
     */
    private generateCookieKeys;
    /**
     * Checks if the given token is an access token.
     * The AccessToken interface is not exported so we have to access it like this.
     */
    private isAccessToken;
    /**
     * Adds the necessary claims the to id token and access token based on the Solid OIDC spec.
     */
    private configureClaims;
    /**
     * Creates the route string as required by the `oidc-provider` library.
     * In case base URL is `http://test.com/foo/`, `idpPath` is `/idp` and `relative` is `device/auth`,
     * this would result in `/foo/idp/device/auth`.
     */
    private createRoute;
    /**
     * Sets up all the IDP routes relative to the IDP path.
     */
    private configureRoutes;
    /**
     * Pipes library errors to the provided ErrorHandler and ResponseWriter.
     */
    private configureErrors;
}
