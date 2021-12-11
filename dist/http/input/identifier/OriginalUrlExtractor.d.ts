import type { HttpRequest } from '../../../server/HttpRequest';
import type { ResourceIdentifier } from '../../representation/ResourceIdentifier';
import { TargetExtractor } from './TargetExtractor';
/**
 * Reconstructs the original URL of an incoming {@link HttpRequest}.
 */
export declare class OriginalUrlExtractor extends TargetExtractor {
    private readonly includeQueryString;
    constructor(options?: {
        includeQueryString?: boolean;
    });
    handle({ request: { url, connection, headers } }: {
        request: HttpRequest;
    }): Promise<ResourceIdentifier>;
}
