"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkRelParser = void 0;
const n3_1 = require("n3");
const LogUtil_1 = require("../../../logging/LogUtil");
const HeaderUtil_1 = require("../../../util/HeaderUtil");
const MetadataParser_1 = require("./MetadataParser");
var namedNode = n3_1.DataFactory.namedNode;
/**
 * Parses Link headers with a specific `rel` value and adds them as metadata with the given predicate.
 */
class LinkRelParser extends MetadataParser_1.MetadataParser {
    constructor(linkRelMap) {
        super();
        this.logger = LogUtil_1.getLoggerFor(this);
        this.linkRelMap = Object.fromEntries(Object.entries(linkRelMap).map(([header, uri]) => [header, namedNode(uri)]));
    }
    async handle(input) {
        var _a;
        const link = (_a = input.request.headers.link) !== null && _a !== void 0 ? _a : [];
        const entries = Array.isArray(link) ? link : [link];
        for (const entry of entries) {
            this.parseLink(entry, input.metadata);
        }
    }
    parseLink(linkEntry, metadata) {
        const { result, replacements } = HeaderUtil_1.transformQuotedStrings(linkEntry);
        for (const part of HeaderUtil_1.splitAndClean(result)) {
            const [link, ...parameters] = part.split(/\s*;\s*/u);
            if (/^[^<]|[^>]$/u.test(link)) {
                this.logger.warn(`Invalid link header ${part}.`);
                continue;
            }
            for (const { name, value } of HeaderUtil_1.parseParameters(parameters, replacements)) {
                if (name === 'rel' && this.linkRelMap[value]) {
                    metadata.add(this.linkRelMap[value], namedNode(link.slice(1, -1)));
                }
            }
        }
    }
}
exports.LinkRelParser = LinkRelParser;
//# sourceMappingURL=LinkRelParser.js.map