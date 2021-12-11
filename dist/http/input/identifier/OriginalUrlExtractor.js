"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OriginalUrlExtractor = void 0;
const BadRequestHttpError_1 = require("../../../util/errors/BadRequestHttpError");
const InternalServerError_1 = require("../../../util/errors/InternalServerError");
const HeaderUtil_1 = require("../../../util/HeaderUtil");
const PathUtil_1 = require("../../../util/PathUtil");
const TargetExtractor_1 = require("./TargetExtractor");
/**
 * Reconstructs the original URL of an incoming {@link HttpRequest}.
 */
class OriginalUrlExtractor extends TargetExtractor_1.TargetExtractor {
    constructor(options = {}) {
        var _a;
        super();
        this.includeQueryString = (_a = options.includeQueryString) !== null && _a !== void 0 ? _a : true;
    }
    async handle({ request: { url, connection, headers } }) {
        var _a;
        if (!url) {
            throw new InternalServerError_1.InternalServerError('Missing URL');
        }
        // Extract host and protocol (possibly overridden by the Forwarded/X-Forwarded-* header)
        let { host } = headers;
        let protocol = ((_a = connection) === null || _a === void 0 ? void 0 : _a.encrypted) ? 'https' : 'http';
        // Check Forwarded/X-Forwarded-* headers
        const forwarded = HeaderUtil_1.parseForwarded(headers);
        if (forwarded.host) {
            ({ host } = forwarded);
        }
        if (forwarded.proto) {
            ({ proto: protocol } = forwarded);
        }
        // Perform a sanity check on the host
        if (!host) {
            throw new BadRequestHttpError_1.BadRequestHttpError('Missing Host header');
        }
        if (/[/\\*]/u.test(host)) {
            throw new BadRequestHttpError_1.BadRequestHttpError(`The request has an invalid Host header: ${host}`);
        }
        // URL object applies punycode encoding to domain
        const originalUrl = new URL(`${protocol}://${host}`);
        const [, pathname, search] = /^([^?]*)(.*)/u.exec(PathUtil_1.toCanonicalUriPath(url));
        originalUrl.pathname = pathname;
        if (this.includeQueryString && search) {
            originalUrl.search = search;
        }
        return { path: originalUrl.href };
    }
}
exports.OriginalUrlExtractor = OriginalUrlExtractor;
//# sourceMappingURL=OriginalUrlExtractor.js.map