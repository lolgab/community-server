import type { Representation } from '../../http/representation/Representation';
import type { RepresentationConverterArgs } from './RepresentationConverter';
import { TypedRepresentationConverter } from './TypedRepresentationConverter';
/**
 * Converts an Error object to JSON by copying its fields.
 */
export declare class ErrorToJsonConverter extends TypedRepresentationConverter {
    constructor();
    handle({ representation }: RepresentationConverterArgs): Promise<Representation>;
}
