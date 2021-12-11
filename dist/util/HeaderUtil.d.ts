/// <reference types="node" />
import type { IncomingHttpHeaders } from 'http';
import type { HttpResponse } from '../server/HttpResponse';
/**
 * General interface for all Accept* headers.
 */
export interface AcceptHeader {
    /** Requested range. Can be a specific value or `*`, matching all. */
    range: string;
    /** Weight of the preference [0, 1]. */
    weight: number;
}
/**
 * Contents of an HTTP Accept header.
 * Range is type/subtype. Both can be `*`.
 */
export interface Accept extends AcceptHeader {
    parameters: {
        /** Media type parameters. These are the parameters that came before the q value. */
        mediaType: Record<string, string>;
        /**
         * Extension parameters. These are the parameters that came after the q value.
         * Value will be an empty string if there was none.
         */
        extension: Record<string, string>;
    };
}
/**
 * Contents of an HTTP Accept-Charset header.
 */
export interface AcceptCharset extends AcceptHeader {
}
/**
 * Contents of an HTTP Accept-Encoding header.
 */
export interface AcceptEncoding extends AcceptHeader {
}
/**
 * Contents of an HTTP Accept-Language header.
 */
export interface AcceptLanguage extends AcceptHeader {
}
/**
 * Contents of an HTTP Accept-Datetime header.
 */
export interface AcceptDatetime extends AcceptHeader {
}
/**
 * Replaces all double quoted strings in the input string with `"0"`, `"1"`, etc.
 * @param input - The Accept header string.
 *
 * @returns The transformed string and a map with keys `"0"`, etc. and values the original string that was there.
 */
export declare function transformQuotedStrings(input: string): {
    result: string;
    replacements: Record<string, string>;
};
/**
 * Splits the input string on commas, trims all parts and filters out empty ones.
 *
 * @param input - Input header string.
 */
export declare function splitAndClean(input: string): string[];
/**
 * Parses a list of split parameters and checks their validity.
 *
 * @param parameters - A list of split parameters (token [ "=" ( token / quoted-string ) ])
 * @param replacements - The double quoted strings that need to be replaced.
 *
 *
 * @throws {@link BadRequestHttpError}
 * Thrown on invalid parameter syntax.
 *
 * @returns An array of name/value objects corresponding to the parameters.
 */
export declare function parseParameters(parameters: string[], replacements: Record<string, string>): {
    name: string;
    value: string;
}[];
/**
 * Parses an Accept header string.
 *
 * @param input - The Accept header string.
 *
 * @throws {@link BadRequestHttpError}
 * Thrown on invalid header syntax.
 *
 * @returns An array of {@link Accept} objects, sorted by weight.
 */
export declare function parseAccept(input: string): Accept[];
/**
 * Parses an Accept-Charset header string.
 *
 * @param input - The Accept-Charset header string.
 *
 * @throws {@link BadRequestHttpError}
 * Thrown on invalid header syntax.
 *
 * @returns An array of {@link AcceptCharset} objects, sorted by weight.
 */
export declare function parseAcceptCharset(input: string): AcceptCharset[];
/**
 * Parses an Accept-Encoding header string.
 *
 * @param input - The Accept-Encoding header string.
 *
 * @throws {@link BadRequestHttpError}
 * Thrown on invalid header syntax.
 *
 * @returns An array of {@link AcceptEncoding} objects, sorted by weight.
 */
export declare function parseAcceptEncoding(input: string): AcceptEncoding[];
/**
 * Parses an Accept-Language header string.
 *
 * @param input - The Accept-Language header string.
 *
 * @throws {@link BadRequestHttpError}
 * Thrown on invalid header syntax.
 *
 * @returns An array of {@link AcceptLanguage} objects, sorted by weight.
 */
export declare function parseAcceptLanguage(input: string): AcceptLanguage[];
/**
 * Parses an Accept-DateTime header string.
 *
 * @param input - The Accept-DateTime header string.
 *
 * @returns An array with a single {@link AcceptDatetime} object.
 */
export declare function parseAcceptDateTime(input: string): AcceptDatetime[];
/**
 * Adds a header value without overriding previous values.
 */
export declare function addHeader(response: HttpResponse, name: string, value: string | string[]): void;
/**
 * Parses the Content-Type header.
 *
 * @param contentType - The media type of the content-type header
 *
 * @returns The parsed media type of the content-type
 */
export declare function parseContentType(contentType: string): {
    type: string;
};
/**
 * The Forwarded header from RFC7239
 */
export interface Forwarded {
    /** The user-agent facing interface of the proxy */
    by?: string;
    /** The node making the request to the proxy */
    for?: string;
    /** The host request header field as received by the proxy */
    host?: string;
    /** The protocol used to make the request */
    proto?: string;
}
/**
 * Parses a Forwarded header value and will fall back to X-Forwarded-* headers.
 *
 * @param headers - The incoming HTTP headers.
 *
 * @returns The parsed Forwarded header.
 */
export declare function parseForwarded(headers: IncomingHttpHeaders): Forwarded;
