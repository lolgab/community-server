import type { Representation } from '../../http/representation/Representation';
import type { RepresentationConverterArgs } from './RepresentationConverter';
import { RepresentationConverter } from './RepresentationConverter';
/**
 * A {@link RepresentationConverter} that changes the content type
 * but does not alter the representation.
 *
 * Useful for when a content type is binary-compatible with another one;
 * for instance, all JSON-LD files are valid JSON files.
 */
export declare class ContentTypeReplacer extends RepresentationConverter {
    private readonly contentTypeMap;
    /**
     * @param replacements - Map of content type patterns and content types to replace them by.
     */
    constructor(replacements: Record<string, string>);
    constructor(replacements: Record<string, Iterable<string>>);
    canHandle({ representation, preferences }: RepresentationConverterArgs): Promise<void>;
    /**
     * Changes the content type on the representation.
     */
    handle({ representation, preferences }: RepresentationConverterArgs): Promise<Representation>;
    handleSafe(args: RepresentationConverterArgs): Promise<Representation>;
    /**
     * Find a replacement content type that matches the preferences,
     * or throws an error if none was found.
     */
    private getReplacementType;
}
