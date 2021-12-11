import type { KeyValueStorage } from '../../storage/keyvalue/KeyValueStorage';
import type { JwksKeyGenerator } from './JwksKeyGenerator';
export interface BasicJwksKeyGeneratorArgs {
    storage: KeyValueStorage<string, unknown>;
}
export declare class BasicJwksKeyGenerator implements JwksKeyGenerator {
    private readonly storage;
    constructor(args: BasicJwksKeyGeneratorArgs);
    /**
     * Generates a JWKS using a single RS256 JWK..
     * The JWKS will be cached so subsequent calls return the same key.
     */
    getPrivateJwks(keyName: string): Promise<{
        keys: any[];
    }>;
    getPublicJwks(keyName: string): Promise<{
        keys: any[];
    }>;
    private generateAndSaveKeys;
}
