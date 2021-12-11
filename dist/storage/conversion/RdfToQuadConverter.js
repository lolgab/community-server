"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdfToQuadConverter = void 0;
const stream_1 = require("stream");
const rdf_parse_1 = __importDefault(require("rdf-parse"));
const BasicRepresentation_1 = require("../../http/representation/BasicRepresentation");
const ContentTypes_1 = require("../../util/ContentTypes");
const BadRequestHttpError_1 = require("../../util/errors/BadRequestHttpError");
const StreamUtil_1 = require("../../util/StreamUtil");
const TypedRepresentationConverter_1 = require("./TypedRepresentationConverter");
/**
 * Converts most major RDF serializations to `internal/quads`.
 */
class RdfToQuadConverter extends TypedRepresentationConverter_1.TypedRepresentationConverter {
    constructor() {
        super(rdf_parse_1.default.getContentTypesPrioritized(), ContentTypes_1.INTERNAL_QUADS);
    }
    async handle({ representation, identifier }) {
        const rawQuads = rdf_parse_1.default.parse(representation.data, {
            contentType: representation.metadata.contentType,
            baseIRI: identifier.path,
        });
        const pass = new stream_1.PassThrough({ objectMode: true });
        const data = StreamUtil_1.pipeSafely(rawQuads, pass, (error) => new BadRequestHttpError_1.BadRequestHttpError(error.message));
        return new BasicRepresentation_1.BasicRepresentation(data, representation.metadata, ContentTypes_1.INTERNAL_QUADS);
    }
}
exports.RdfToQuadConverter = RdfToQuadConverter;
//# sourceMappingURL=RdfToQuadConverter.js.map