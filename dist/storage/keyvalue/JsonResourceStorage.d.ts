import type { ResourceStore } from '../ResourceStore';
import type { KeyValueStorage } from './KeyValueStorage';
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
export declare class JsonResourceStorage implements KeyValueStorage<string, unknown> {
    private readonly source;
    private readonly container;
    constructor(source: ResourceStore, baseUrl: string, container: string);
    get(key: string): Promise<unknown | undefined>;
    has(key: string): Promise<boolean>;
    set(key: string, value: unknown): Promise<this>;
    delete(key: string): Promise<boolean>;
    entries(): AsyncIterableIterator<[string, unknown]>;
    /**
     * Converts a key into an identifier for internal storage.
     */
    private createIdentifier;
    /**
     * Converts an internal storage identifier string into the original identifier key.
     */
    private parseMember;
}
