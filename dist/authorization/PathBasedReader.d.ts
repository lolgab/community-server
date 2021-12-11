import type { PermissionReaderInput } from './PermissionReader';
import { PermissionReader } from './PermissionReader';
import type { PermissionSet } from './permissions/Permissions';
/**
 * Redirects requests to specific PermissionReaders based on their identifier.
 * The keys in the input map will be converted to regular expressions.
 * The regular expressions should all start with a slash
 * and will be evaluated relative to the base URL.
 *
 * Will error if no match is found.
 */
export declare class PathBasedReader extends PermissionReader {
    private readonly baseUrl;
    private readonly paths;
    constructor(baseUrl: string, paths: Record<string, PermissionReader>);
    canHandle(input: PermissionReaderInput): Promise<void>;
    handle(input: PermissionReaderInput): Promise<PermissionSet>;
    /**
     * Find the PermissionReader corresponding to the given path.
     * Errors if there is no match.
     */
    private findReader;
}
