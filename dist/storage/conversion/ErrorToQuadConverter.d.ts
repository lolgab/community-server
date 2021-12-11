import type { Representation } from '../../http/representation/Representation';
import type { RepresentationConverterArgs } from './RepresentationConverter';
import { TypedRepresentationConverter } from './TypedRepresentationConverter';
/**
 * Converts an error object into quads by creating a triple for each of name/message/stack.
 */
export declare class ErrorToQuadConverter extends TypedRepresentationConverter {
    constructor();
    handle({ identifier, representation }: RepresentationConverterArgs): Promise<Representation>;
}
