"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkRelMetadataWriter = void 0;
const LogUtil_1 = require("../../../logging/LogUtil");
const HeaderUtil_1 = require("../../../util/HeaderUtil");
const MetadataWriter_1 = require("./MetadataWriter");
/**
 * A {@link MetadataWriter} that takes a linking metadata predicates to Link header "rel" values.
 * The values of the objects will be put in a Link header with the corresponding "rel" value.
 */
class LinkRelMetadataWriter extends MetadataWriter_1.MetadataWriter {
    constructor(linkRelMap) {
        super();
        this.logger = LogUtil_1.getLoggerFor(this);
        this.linkRelMap = linkRelMap;
    }
    async handle(input) {
        const keys = Object.keys(this.linkRelMap);
        this.logger.debug(`Available link relations: ${keys.length}`);
        for (const key of keys) {
            const values = input.metadata.getAll(key).map((term) => `<${term.value}>; rel="${this.linkRelMap[key]}"`);
            if (values.length > 0) {
                this.logger.debug(`Adding Link header ${values}`);
                HeaderUtil_1.addHeader(input.response, 'Link', values);
            }
        }
    }
}
exports.LinkRelMetadataWriter = LinkRelMetadataWriter;
//# sourceMappingURL=LinkRelMetadataWriter.js.map