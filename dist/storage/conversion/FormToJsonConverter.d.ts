import type { Representation } from '../../http/representation/Representation';
import type { RepresentationConverterArgs } from './RepresentationConverter';
import { TypedRepresentationConverter } from './TypedRepresentationConverter';
/**
 * Converts application/x-www-form-urlencoded data to application/json.
 * Due to the nature of form data, the result will be a simple key/value JSON object.
 */
export declare class FormToJsonConverter extends TypedRepresentationConverter {
    constructor();
    handle({ representation }: RepresentationConverterArgs): Promise<Representation>;
}
