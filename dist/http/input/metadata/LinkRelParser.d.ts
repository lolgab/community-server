import type { HttpRequest } from '../../../server/HttpRequest';
import type { RepresentationMetadata } from '../../representation/RepresentationMetadata';
import { MetadataParser } from './MetadataParser';
/**
 * Parses Link headers with a specific `rel` value and adds them as metadata with the given predicate.
 */
export declare class LinkRelParser extends MetadataParser {
    protected readonly logger: import("../../..").Logger;
    private readonly linkRelMap;
    constructor(linkRelMap: Record<string, string>);
    handle(input: {
        request: HttpRequest;
        metadata: RepresentationMetadata;
    }): Promise<void>;
    protected parseLink(linkEntry: string, metadata: RepresentationMetadata): void;
}
