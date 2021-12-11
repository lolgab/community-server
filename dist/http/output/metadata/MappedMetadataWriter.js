"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MappedMetadataWriter = void 0;
const HeaderUtil_1 = require("../../../util/HeaderUtil");
const MetadataWriter_1 = require("./MetadataWriter");
/**
 * A {@link MetadataWriter} that takes a map directly converting metadata predicates to headers.
 * The header value(s) will be the same as the corresponding object value(s).
 */
class MappedMetadataWriter extends MetadataWriter_1.MetadataWriter {
    constructor(headerMap) {
        super();
        this.headerMap = Object.entries(headerMap);
    }
    async handle(input) {
        for (const [predicate, header] of this.headerMap) {
            const terms = input.metadata.getAll(predicate);
            if (terms.length > 0) {
                HeaderUtil_1.addHeader(input.response, header, terms.map((term) => term.value));
            }
        }
    }
}
exports.MappedMetadataWriter = MappedMetadataWriter;
//# sourceMappingURL=MappedMetadataWriter.js.map