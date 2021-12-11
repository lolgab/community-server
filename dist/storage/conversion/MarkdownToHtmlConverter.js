"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkdownToHtmlConverter = void 0;
const marked_1 = __importDefault(require("marked"));
const BasicRepresentation_1 = require("../../http/representation/BasicRepresentation");
const ContentTypes_1 = require("../../util/ContentTypes");
const StreamUtil_1 = require("../../util/StreamUtil");
const TypedRepresentationConverter_1 = require("./TypedRepresentationConverter");
/**
 * Converts Markdown data to HTML.
 * The generated HTML will be injected into the given template using the parameter `htmlBody`.
 * A standard Markdown string will be converted to a <p> tag, so html and body tags should be part of the template.
 * In case the Markdown body starts with a header (#), that value will also be used as `title` parameter.
 */
class MarkdownToHtmlConverter extends TypedRepresentationConverter_1.TypedRepresentationConverter {
    constructor(templateEngine) {
        super(ContentTypes_1.TEXT_MARKDOWN, ContentTypes_1.TEXT_HTML);
        this.templateEngine = templateEngine;
    }
    async handle({ representation }) {
        const markdown = await StreamUtil_1.readableToString(representation.data);
        const htmlBody = marked_1.default(markdown);
        const html = await this.templateEngine.render({ htmlBody });
        return new BasicRepresentation_1.BasicRepresentation(html, representation.metadata, ContentTypes_1.TEXT_HTML);
    }
}
exports.MarkdownToHtmlConverter = MarkdownToHtmlConverter;
//# sourceMappingURL=MarkdownToHtmlConverter.js.map