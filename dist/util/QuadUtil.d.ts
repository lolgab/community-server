/// <reference types="node" />
import type { Readable } from 'stream';
import type { ParserOptions } from 'n3';
import type { Quad } from 'rdf-js';
import type { Guarded } from './GuardedStream';
export declare function serializeQuads(quads: Quad[], contentType?: string): Guarded<Readable>;
/**
 * Helper function to convert a Readable into an array of quads.
 * @param readable - The readable object.
 * @param options - Options for the parser.
 *
 * @returns A promise containing the array of quads.
 */
export declare function parseQuads(readable: Guarded<Readable>, options?: ParserOptions): Promise<Quad[]>;
