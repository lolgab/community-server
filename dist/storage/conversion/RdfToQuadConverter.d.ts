import type { Representation } from '../../http/representation/Representation';
import type { RepresentationConverterArgs } from './RepresentationConverter';
import { TypedRepresentationConverter } from './TypedRepresentationConverter';
/**
 * Converts most major RDF serializations to `internal/quads`.
 */
export declare class RdfToQuadConverter extends TypedRepresentationConverter {
    constructor();
    handle({ representation, identifier }: RepresentationConverterArgs): Promise<Representation>;
}
