import type { Representation } from '../http/representation/Representation';
import type { RepresentationConverter } from '../storage/conversion/RepresentationConverter';
/**
 * Fetches an RDF dataset from the given URL.
 * Input can also be a Response if the request was already made.
 * In case the given Response object was already parsed its body can be passed along as a string.
 *
 * The converter will be used to convert the response body to RDF.
 *
 * Response will be a Representation with content-type internal/quads.
 */
export declare function fetchDataset(url: string, converter: RepresentationConverter): Promise<Representation>;
export declare function fetchDataset(response: Response, converter: RepresentationConverter, body?: string): Promise<Representation>;
