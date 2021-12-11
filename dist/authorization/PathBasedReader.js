"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PathBasedReader = void 0;
const NotImplementedHttpError_1 = require("../util/errors/NotImplementedHttpError");
const PathUtil_1 = require("../util/PathUtil");
const PermissionReader_1 = require("./PermissionReader");
/**
 * Redirects requests to specific PermissionReaders based on their identifier.
 * The keys in the input map will be converted to regular expressions.
 * The regular expressions should all start with a slash
 * and will be evaluated relative to the base URL.
 *
 * Will error if no match is found.
 */
class PathBasedReader extends PermissionReader_1.PermissionReader {
    constructor(baseUrl, paths) {
        super();
        this.baseUrl = PathUtil_1.ensureTrailingSlash(baseUrl);
        const entries = Object.entries(paths)
            .map(([key, val]) => [new RegExp(key, 'u'), val]);
        this.paths = new Map(entries);
    }
    async canHandle(input) {
        const reader = this.findReader(input.identifier.path);
        await reader.canHandle(input);
    }
    async handle(input) {
        const reader = this.findReader(input.identifier.path);
        return reader.handle(input);
    }
    /**
     * Find the PermissionReader corresponding to the given path.
     * Errors if there is no match.
     */
    findReader(path) {
        if (path.startsWith(this.baseUrl)) {
            // We want to keep the leading slash
            const relative = path.slice(PathUtil_1.trimTrailingSlashes(this.baseUrl).length);
            for (const [regex, reader] of this.paths) {
                if (regex.test(relative)) {
                    return reader;
                }
            }
        }
        throw new NotImplementedHttpError_1.NotImplementedHttpError('No regex matches the given path.');
    }
}
exports.PathBasedReader = PathBasedReader;
//# sourceMappingURL=PathBasedReader.js.map