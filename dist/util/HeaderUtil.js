"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseForwarded = exports.parseContentType = exports.addHeader = exports.parseAcceptDateTime = exports.parseAcceptLanguage = exports.parseAcceptEncoding = exports.parseAcceptCharset = exports.parseAccept = exports.parseParameters = exports.splitAndClean = exports.transformQuotedStrings = void 0;
const LogUtil_1 = require("../logging/LogUtil");
const BadRequestHttpError_1 = require("./errors/BadRequestHttpError");
const logger = LogUtil_1.getLoggerFor('HeaderUtil');
// REUSED REGEXES
const token = /^[a-zA-Z0-9!#$%&'*+-.^_`|~]+$/u;
// HELPER FUNCTIONS
/**
 * Replaces all double quoted strings in the input string with `"0"`, `"1"`, etc.
 * @param input - The Accept header string.
 *
 * @returns The transformed string and a map with keys `"0"`, etc. and values the original string that was there.
 */
function transformQuotedStrings(input) {
    let idx = 0;
    const replacements = {};
    const result = input.replace(/"(?:[^"\\]|\\.)*"/gu, (match) => {
        // Not all characters allowed in quoted strings, see BNF above
        if (!/^"(?:[\t !\u0023-\u005B\u005D-\u007E\u0080-\u00FF]|(?:\\[\t\u0020-\u007E\u0080-\u00FF]))*"$/u.test(match)) {
            logger.warn(`Invalid quoted string in header: ${match}`);
            throw new BadRequestHttpError_1.BadRequestHttpError(`Invalid quoted string in header: ${match}`);
        }
        const replacement = `"${idx}"`;
        replacements[replacement] = match.slice(1, -1);
        idx += 1;
        return replacement;
    });
    return { result, replacements };
}
exports.transformQuotedStrings = transformQuotedStrings;
/**
 * Splits the input string on commas, trims all parts and filters out empty ones.
 *
 * @param input - Input header string.
 */
function splitAndClean(input) {
    return input.split(',')
        .map((part) => part.trim())
        .filter((part) => part.length > 0);
}
exports.splitAndClean = splitAndClean;
/**
 * Checks if the input string matches the qvalue regex.
 *
 * @param qvalue - Input qvalue string (so "q=....").
 *
 * @throws {@link BadRequestHttpError}
 * Thrown on invalid syntax.
 */
function testQValue(qvalue) {
    if (!/^(?:(?:0(?:\.\d{0,3})?)|(?:1(?:\.0{0,3})?))$/u.test(qvalue)) {
        logger.warn(`Invalid q value: ${qvalue}`);
        throw new BadRequestHttpError_1.BadRequestHttpError(`Invalid q value: ${qvalue} does not match ( "0" [ "." 0*3DIGIT ] ) / ( "1" [ "." 0*3("0") ] ).`);
    }
}
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
function parseParameters(parameters, replacements) {
    return parameters.map((param) => {
        const [name, rawValue] = param.split('=').map((str) => str.trim());
        // Test replaced string for easier check
        // parameter  = token "=" ( token / quoted-string )
        // second part is optional for certain parameters
        if (!(token.test(name) && (!rawValue || /^"\d+"$/u.test(rawValue) || token.test(rawValue)))) {
            logger.warn(`Invalid parameter value: ${name}=${replacements[rawValue] || rawValue}`);
            throw new BadRequestHttpError_1.BadRequestHttpError(`Invalid parameter value: ${name}=${replacements[rawValue] || rawValue} ` +
                `does not match (token ( "=" ( token / quoted-string ))?). `);
        }
        let value = rawValue;
        if (value in replacements) {
            value = replacements[rawValue];
        }
        return { name, value };
    });
}
exports.parseParameters = parseParameters;
/**
 * Parses a single media range with corresponding parameters from an Accept header.
 * For every parameter value that is a double quoted string,
 * we check if it is a key in the replacements map.
 * If yes the value from the map gets inserted instead.
 *
 * @param part - A string corresponding to a media range and its corresponding parameters.
 * @param replacements - The double quoted strings that need to be replaced.
 *
 * @throws {@link BadRequestHttpError}
 * Thrown on invalid type, qvalue or parameter syntax.
 *
 * @returns {@link Accept} object corresponding to the header string.
 */
function parseAcceptPart(part, replacements) {
    const [range, ...parameters] = part.split(';').map((param) => param.trim());
    // No reason to test differently for * since we don't check if the type exists
    const [type, subtype] = range.split('/');
    if (!type || !subtype || !token.test(type) || !token.test(subtype)) {
        logger.warn(`Invalid Accept range: ${range}`);
        throw new BadRequestHttpError_1.BadRequestHttpError(`Invalid Accept range: ${range} does not match ( "*/*" / ( token "/" "*" ) / ( token "/" token ) )`);
    }
    let weight = 1;
    const mediaTypeParams = {};
    const extensionParams = {};
    let map = mediaTypeParams;
    const parsedParams = parseParameters(parameters, replacements);
    parsedParams.forEach(({ name, value }) => {
        if (name === 'q') {
            // Extension parameters appear after the q value
            map = extensionParams;
            testQValue(value);
            weight = Number.parseFloat(value);
        }
        else {
            if (!value && map !== extensionParams) {
                logger.warn(`Invalid Accept parameter ${name}`);
                throw new BadRequestHttpError_1.BadRequestHttpError(`Invalid Accept parameter ${name}: ` +
                    `Accept parameter values are not optional when preceding the q value`);
            }
            map[name] = value || '';
        }
    });
    return {
        range,
        weight,
        parameters: {
            mediaType: mediaTypeParams,
            extension: extensionParams,
        },
    };
}
/**
 * Parses an Accept-* header where each part is only a value and a weight, so roughly /.*(q=.*)?/ separated by commas.
 * @param input - Input header string.
 *
 * @throws {@link BadRequestHttpError}
 * Thrown on invalid qvalue syntax.
 *
 * @returns An array of ranges and weights.
 */
function parseNoParameters(input) {
    const parts = splitAndClean(input);
    return parts.map((part) => {
        const [range, qvalue] = part.split(';').map((param) => param.trim());
        const result = { range, weight: 1 };
        if (qvalue) {
            if (!qvalue.startsWith('q=')) {
                logger.warn(`Only q parameters are allowed in ${input}`);
                throw new BadRequestHttpError_1.BadRequestHttpError(`Only q parameters are allowed in ${input}`);
            }
            const val = qvalue.slice(2);
            testQValue(val);
            result.weight = Number.parseFloat(val);
        }
        return result;
    }).sort((left, right) => right.weight - left.weight);
}
// EXPORTED FUNCTIONS
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
function parseAccept(input) {
    // Quoted strings could prevent split from having correct results
    const { result, replacements } = transformQuotedStrings(input);
    return splitAndClean(result)
        .map((part) => parseAcceptPart(part, replacements))
        .sort((left, right) => right.weight - left.weight);
}
exports.parseAccept = parseAccept;
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
function parseAcceptCharset(input) {
    const results = parseNoParameters(input);
    results.forEach((result) => {
        if (!token.test(result.range)) {
            logger.warn(`Invalid Accept-Charset range: ${result.range}`);
            throw new BadRequestHttpError_1.BadRequestHttpError(`Invalid Accept-Charset range: ${result.range} does not match (content-coding / "identity" / "*")`);
        }
    });
    return results;
}
exports.parseAcceptCharset = parseAcceptCharset;
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
function parseAcceptEncoding(input) {
    const results = parseNoParameters(input);
    results.forEach((result) => {
        if (!token.test(result.range)) {
            logger.warn(`Invalid Accept-Encoding range: ${result.range}`);
            throw new BadRequestHttpError_1.BadRequestHttpError(`Invalid Accept-Encoding range: ${result.range} does not match (charset / "*")`);
        }
    });
    return results;
}
exports.parseAcceptEncoding = parseAcceptEncoding;
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
function parseAcceptLanguage(input) {
    const results = parseNoParameters(input);
    results.forEach((result) => {
        // (1*8ALPHA *("-" 1*8alphanum)) / "*"
        if (result.range !== '*' && !/^[a-zA-Z]{1,8}(?:-[a-zA-Z0-9]{1,8})*$/u.test(result.range)) {
            logger.warn(`Invalid Accept-Language range: ${result.range}`);
            throw new BadRequestHttpError_1.BadRequestHttpError(`Invalid Accept-Language range: ${result.range} does not match ((1*8ALPHA *("-" 1*8alphanum)) / "*")`);
        }
    });
    return results;
}
exports.parseAcceptLanguage = parseAcceptLanguage;
// eslint-disable-next-line max-len
const rfc1123Date = /^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun), \d{2} (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4} \d{2}:\d{2}:\d{2} GMT$/u;
/**
 * Parses an Accept-DateTime header string.
 *
 * @param input - The Accept-DateTime header string.
 *
 * @returns An array with a single {@link AcceptDatetime} object.
 */
function parseAcceptDateTime(input) {
    const results = [];
    const range = input.trim();
    if (range) {
        if (!rfc1123Date.test(range)) {
            logger.warn(`Invalid Accept-DateTime range: ${range}`);
            throw new BadRequestHttpError_1.BadRequestHttpError(`Invalid Accept-DateTime range: ${range} does not match the RFC1123 format`);
        }
        results.push({ range, weight: 1 });
    }
    return results;
}
exports.parseAcceptDateTime = parseAcceptDateTime;
/**
 * Adds a header value without overriding previous values.
 */
function addHeader(response, name, value) {
    let allValues = [];
    if (response.hasHeader(name)) {
        let oldValues = response.getHeader(name);
        if (typeof oldValues === 'string') {
            oldValues = [oldValues];
        }
        else if (typeof oldValues === 'number') {
            oldValues = [`${oldValues}`];
        }
        allValues = oldValues;
    }
    if (Array.isArray(value)) {
        allValues.push(...value);
    }
    else {
        allValues.push(value);
    }
    response.setHeader(name, allValues.length === 1 ? allValues[0] : allValues);
}
exports.addHeader = addHeader;
/**
 * Parses the Content-Type header.
 *
 * @param contentType - The media type of the content-type header
 *
 * @returns The parsed media type of the content-type
 */
function parseContentType(contentType) {
    const contentTypeValue = /^\s*([^;\s]*)/u.exec(contentType)[1];
    return { type: contentTypeValue };
}
exports.parseContentType = parseContentType;
/**
 * Parses a Forwarded header value and will fall back to X-Forwarded-* headers.
 *
 * @param headers - The incoming HTTP headers.
 *
 * @returns The parsed Forwarded header.
 */
function parseForwarded(headers) {
    const forwarded = {};
    if (headers.forwarded) {
        for (const pair of headers.forwarded.replace(/\s*,.*/u, '').split(';')) {
            const components = /^(by|for|host|proto)=(.+)$/u.exec(pair);
            if (components) {
                forwarded[components[1]] = components[2];
            }
        }
    }
    else {
        const suffixes = ['host', 'proto'];
        for (const suffix of suffixes) {
            const value = headers[`x-forwarded-${suffix}`];
            if (value) {
                forwarded[suffix] = value.trim().replace(/\s*,.*/u, '');
            }
        }
    }
    return forwarded;
}
exports.parseForwarded = parseForwarded;
//# sourceMappingURL=HeaderUtil.js.map