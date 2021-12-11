"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuadToRdfConverter = void 0;
const n3_1 = require("n3");
const rdf_serialize_1 = __importDefault(require("rdf-serialize"));
const BasicRepresentation_1 = require("../../http/representation/BasicRepresentation");
const ContentTypes_1 = require("../../util/ContentTypes");
const StreamUtil_1 = require("../../util/StreamUtil");
const Vocabularies_1 = require("../../util/Vocabularies");
const ConversionUtil_1 = require("./ConversionUtil");
const TypedRepresentationConverter_1 = require("./TypedRepresentationConverter");
/**
 * Converts `internal/quads` to most major RDF serializations.
 */
class QuadToRdfConverter extends TypedRepresentationConverter_1.TypedRepresentationConverter {
    constructor(options = {}) {
        var _a;
        super(ContentTypes_1.INTERNAL_QUADS, (_a = options.outputPreferences) !== null && _a !== void 0 ? _a : rdf_serialize_1.default.getContentTypesPrioritized());
    }
    async handle({ identifier, representation: quads, preferences }) {
        // Can not be undefined if the `canHandle` call passed
        const contentType = ConversionUtil_1.getConversionTarget(await this.getOutputTypes(), preferences.type);
        let data;
        // Use prefixes if possible (see https://github.com/rubensworks/rdf-serialize.js/issues/1)
        if (/(?:turtle|trig)$/u.test(contentType)) {
            const prefixes = Object.fromEntries(quads.metadata.quads(null, Vocabularies_1.PREFERRED_PREFIX_TERM, null)
                .map(({ subject, object }) => [object.value, subject.value]));
            const options = { format: contentType, baseIRI: identifier.path, prefixes };
            data = StreamUtil_1.pipeSafely(quads.data, new n3_1.StreamWriter(options));
            // Otherwise, write without prefixes
        }
        else {
            data = rdf_serialize_1.default.serialize(quads.data, { contentType });
        }
        return new BasicRepresentation_1.BasicRepresentation(data, quads.metadata, contentType);
    }
}
exports.QuadToRdfConverter = QuadToRdfConverter;
//# sourceMappingURL=QuadToRdfConverter.js.map