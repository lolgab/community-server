import type { Representation } from '../../http/representation/Representation';
import type { RepresentationConverterArgs } from './RepresentationConverter';
import { TypedRepresentationConverter } from './TypedRepresentationConverter';
/**
 * Converts `internal/quads` to most major RDF serializations.
 */
export declare class QuadToRdfConverter extends TypedRepresentationConverter {
    private readonly outputPreferences?;
    constructor(options?: {
        outputPreferences?: Record<string, number>;
    });
    handle({ identifier, representation: quads, preferences }: RepresentationConverterArgs): Promise<Representation>;
}
