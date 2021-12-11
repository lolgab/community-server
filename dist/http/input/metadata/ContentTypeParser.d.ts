import type { HttpRequest } from '../../../server/HttpRequest';
import type { RepresentationMetadata } from '../../representation/RepresentationMetadata';
import { MetadataParser } from './MetadataParser';
/**
 * Parser for the `content-type` header.
 * Currently only stores the media type and ignores other parameters such as charset.
 */
export declare class ContentTypeParser extends MetadataParser {
    handle(input: {
        request: HttpRequest;
        metadata: RepresentationMetadata;
    }): Promise<void>;
}
