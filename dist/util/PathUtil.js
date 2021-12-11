"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinUrl = exports.resolveAssetPath = exports.modulePathPlaceholder = exports.getModuleRoot = exports.createSubdomainRegexp = exports.getRelativeUrl = exports.extractScheme = exports.isContainerIdentifier = exports.isContainerPath = exports.encodeUriPathComponents = exports.decodeUriPathComponents = exports.toCanonicalUriPath = exports.getExtension = exports.trimTrailingSlashes = exports.ensureTrailingSlash = exports.absoluteFilePath = exports.joinFilePath = exports.normalizeFilePath = void 0;
const path_1 = require("path");
const url_join_1 = __importDefault(require("url-join"));
const BadRequestHttpError_1 = require("./errors/BadRequestHttpError");
/**
 * Changes a potential Windows path into a POSIX path.
 *
 * @param path - Path to check (POSIX or Windows).
 *
 * @returns The potentially changed path (POSIX).
 */
function windowsToPosixPath(path) {
    return path.replace(/\\+/gu, '/');
}
/**
 * Resolves relative segments in the path.
 *
 * @param path - Path to check (POSIX or Windows).
 *
 * @returns The potentially changed path (POSIX).
 */
function normalizeFilePath(path) {
    return path_1.posix.normalize(windowsToPosixPath(path));
}
exports.normalizeFilePath = normalizeFilePath;
/**
 * Adds the paths to the base path.
 *
 * @param basePath - The base path (POSIX or Windows).
 * @param paths - Subpaths to attach (POSIX).
 *
 * @returns The potentially changed path (POSIX).
 */
function joinFilePath(basePath, ...paths) {
    return path_1.posix.join(windowsToPosixPath(basePath), ...paths);
}
exports.joinFilePath = joinFilePath;
/**
 * Resolves a path to its absolute form.
 * Absolute inputs will not be changed (except changing Windows to POSIX).
 * Relative inputs will be interpreted relative to process.cwd().
 *
 * @param path - Path to check (POSIX or Windows).
 *
 * @returns The potentially changed path (POSIX).
 */
function absoluteFilePath(path) {
    if (path_1.posix.isAbsolute(path)) {
        return path;
    }
    if (path_1.win32.isAbsolute(path)) {
        return windowsToPosixPath(path);
    }
    return joinFilePath(process.cwd(), path);
}
exports.absoluteFilePath = absoluteFilePath;
/**
 * Makes sure the input path has exactly 1 slash at the end.
 * Multiple slashes will get merged into one.
 * If there is no slash it will be added.
 *
 * @param path - Path to check.
 *
 * @returns The potentially changed path.
 */
function ensureTrailingSlash(path) {
    return path.replace(/\/*$/u, '/');
}
exports.ensureTrailingSlash = ensureTrailingSlash;
/**
 * Makes sure the input path has no slashes at the end.
 *
 * @param path - Path to check.
 *
 * @returns The potentially changed path.
 */
function trimTrailingSlashes(path) {
    return path.replace(/\/+$/u, '');
}
exports.trimTrailingSlashes = trimTrailingSlashes;
/**
 * Extracts the extension (without dot) from a path.
 * Custom function since `path.extname` does not work on all cases (e.g. ".acl")
 * @param path - Input path to parse.
 */
function getExtension(path) {
    const extension = /\.([^./]+)$/u.exec(path);
    return extension ? extension[1] : '';
}
exports.getExtension = getExtension;
/**
 * Performs a transformation on the path components of a URI.
 */
function transformPathComponents(path, transform) {
    const [, base, queryString] = /^([^?]*)(.*)$/u.exec(path);
    const transformed = base.split('/').map((element) => transform(element)).join('/');
    return !queryString ? transformed : `${transformed}${queryString}`;
}
/**
 * Converts a URI path to the canonical version by splitting on slashes,
 * decoding any percent-based encodings, and then encoding any special characters.
 */
function toCanonicalUriPath(path) {
    return transformPathComponents(path, (part) => encodeURIComponent(decodeURIComponent(part)));
}
exports.toCanonicalUriPath = toCanonicalUriPath;
/**
 * Decodes all components of a URI path.
 */
function decodeUriPathComponents(path) {
    return transformPathComponents(path, decodeURIComponent);
}
exports.decodeUriPathComponents = decodeUriPathComponents;
/**
 * Encodes all (non-slash) special characters in a URI path.
 */
function encodeUriPathComponents(path) {
    return transformPathComponents(path, encodeURIComponent);
}
exports.encodeUriPathComponents = encodeUriPathComponents;
/**
 * Checks if the path corresponds to a container path (ending in a /).
 * @param path - Path to check.
 */
function isContainerPath(path) {
    // Solid, §3.1: "Paths ending with a slash denote a container resource."
    // https://solid.github.io/specification/protocol#uri-slash-semantics
    return path.endsWith('/');
}
exports.isContainerPath = isContainerPath;
/**
 * Checks if the identifier corresponds to a container identifier.
 * @param identifier - Identifier to check.
 */
function isContainerIdentifier(identifier) {
    return isContainerPath(identifier.path);
}
exports.isContainerIdentifier = isContainerIdentifier;
/**
 * Splits a URL (or similar) string into a part containing its scheme and one containing the rest.
 * E.g., `http://test.com/` results in `{ scheme: 'http://', rest: 'test.com/' }`.
 * @param url - String to parse.
 */
function extractScheme(url) {
    const match = /^([^:]+:\/\/)(.*)$/u.exec(url);
    return { scheme: match[1], rest: match[2] };
}
exports.extractScheme = extractScheme;
/**
 * Creates a relative URL by removing the base URL.
 * Will throw an error in case the resulting target is not withing the base URL scope.
 * @param baseUrl - Base URL.
 * @param request - Incoming request of which the target needs to be extracted.
 * @param targetExtractor - Will extract the target from the request.
 */
async function getRelativeUrl(baseUrl, request, targetExtractor) {
    baseUrl = ensureTrailingSlash(baseUrl);
    const target = await targetExtractor.handleSafe({ request });
    if (!target.path.startsWith(baseUrl)) {
        throw new BadRequestHttpError_1.BadRequestHttpError(`The identifier ${target.path} is outside the configured identifier space.`, { errorCode: 'E0001', details: { path: target.path } });
    }
    return target.path.slice(baseUrl.length - 1);
}
exports.getRelativeUrl = getRelativeUrl;
/**
 * Creates a regular expression that matches URLs containing the given baseUrl, or a subdomain of the given baseUrl.
 * In case there is a subdomain, the first match of the regular expression will be that subdomain.
 *
 * Examples with baseUrl `http://test.com/foo/`:
 *  - Will match `http://test.com/foo/`
 *  - Will match `http://test.com/foo/bar/baz`
 *  - Will match `http://alice.bob.test.com/foo/bar/baz`, first match result will be `alice.bob`
 *  - Will not match `http://test.com/`
 *  - Will not match `http://alicetest.com/foo/`
 * @param baseUrl - Base URL for the regular expression.
 */
function createSubdomainRegexp(baseUrl) {
    const { scheme, rest } = extractScheme(baseUrl);
    return new RegExp(`^${scheme}(?:([^/]+)\\.)?${rest}`, 'u');
}
exports.createSubdomainRegexp = createSubdomainRegexp;
/**
 * Returns the folder corresponding to the root of the Community Solid Server module
 */
function getModuleRoot() {
    return joinFilePath(__dirname, '../../');
}
exports.getModuleRoot = getModuleRoot;
/**
 * A placeholder for the path to the `@solid/community-server` module root.
 * The resolveAssetPath function will replace this string with the actual path.
 */
exports.modulePathPlaceholder = '@css:';
/**
 * Converts file path inputs into absolute paths.
 * Works similar to `absoluteFilePath` but paths that start with the `modulePathPlaceholder`
 * will be relative to the module directory instead of the cwd.
 */
function resolveAssetPath(path = exports.modulePathPlaceholder) {
    if (path.startsWith(exports.modulePathPlaceholder)) {
        return joinFilePath(getModuleRoot(), path.slice(exports.modulePathPlaceholder.length));
    }
    return absoluteFilePath(path);
}
exports.resolveAssetPath = resolveAssetPath;
/**
 * Concatenates all the given strings into a normalized URL.
 * Will place slashes between input strings if necessary.
 */
exports.joinUrl = url_join_1.default;
//# sourceMappingURL=PathUtil.js.map