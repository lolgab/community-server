"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdfValidator = void 0;
const arrayify_stream_1 = __importDefault(require("arrayify-stream"));
const ContentTypes_1 = require("../../util/ContentTypes");
const ResourceUtil_1 = require("../../util/ResourceUtil");
const Validator_1 = require("./Validator");
/**
 * Validates a Representation by verifying if the data stream contains valid RDF data.
 * It does this by letting the stored RepresentationConverter convert the data.
 */
class RdfValidator extends Validator_1.Validator {
    constructor(converter) {
        super();
        this.converter = converter;
    }
    async handle(representation) {
        // If the data already is quads format we know it's RDF
        if (representation.metadata.contentType === ContentTypes_1.INTERNAL_QUADS) {
            return;
        }
        const identifier = { path: representation.metadata.identifier.value };
        const preferences = { type: { [ContentTypes_1.INTERNAL_QUADS]: 1 } };
        let result;
        try {
            // Creating new representation since converter might edit metadata
            const tempRepresentation = await ResourceUtil_1.cloneRepresentation(representation);
            result = await this.converter.handleSafe({
                identifier,
                representation: tempRepresentation,
                preferences,
            });
        }
        catch (error) {
            representation.data.destroy();
            throw error;
        }
        // Drain stream to make sure data was parsed correctly
        await arrayify_stream_1.default(result.data);
    }
}
exports.RdfValidator = RdfValidator;
//# sourceMappingURL=RdfValidator.js.map