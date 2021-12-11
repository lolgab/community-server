"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentTypeParser = void 0;
const HeaderUtil_1 = require("../../../util/HeaderUtil");
const MetadataParser_1 = require("./MetadataParser");
/**
 * Parser for the `content-type` header.
 * Currently only stores the media type and ignores other parameters such as charset.
 */
class ContentTypeParser extends MetadataParser_1.MetadataParser {
    async handle(input) {
        const contentType = input.request.headers['content-type'];
        if (contentType) {
            input.metadata.contentType = HeaderUtil_1.parseContentType(contentType).type;
        }
    }
}
exports.ContentTypeParser = ContentTypeParser;
//# sourceMappingURL=ContentTypeParser.js.map