"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentTypeReplacer = void 0;
const RepresentationMetadata_1 = require("../../http/representation/RepresentationMetadata");
const NotImplementedHttpError_1 = require("../../util/errors/NotImplementedHttpError");
const ConversionUtil_1 = require("./ConversionUtil");
const RepresentationConverter_1 = require("./RepresentationConverter");
/**
 * A {@link RepresentationConverter} that changes the content type
 * but does not alter the representation.
 *
 * Useful for when a content type is binary-compatible with another one;
 * for instance, all JSON-LD files are valid JSON files.
 */
class ContentTypeReplacer extends RepresentationConverter_1.RepresentationConverter {
    constructor(replacements) {
        super();
        this.contentTypeMap = {};
        // Store the replacements as value preferences,
        // completing any transitive chains (A:B, B:C, C:D => A:B,C,D)
        for (const inputType of Object.keys(replacements)) {
            this.contentTypeMap[inputType] = {};
            (function addReplacements(inType, outTypes) {
                var _a;
                const replace = (_a = replacements[inType]) !== null && _a !== void 0 ? _a : [];
                const newTypes = typeof replace === 'string' ? [replace] : replace;
                for (const newType of newTypes) {
                    if (!(newType in outTypes)) {
                        outTypes[newType] = 1;
                        addReplacements(newType, outTypes);
                    }
                }
            })(inputType, this.contentTypeMap[inputType]);
        }
    }
    async canHandle({ representation, preferences }) {
        this.getReplacementType(representation.metadata.contentType, preferences.type);
    }
    /**
     * Changes the content type on the representation.
     */
    async handle({ representation, preferences }) {
        const contentType = this.getReplacementType(representation.metadata.contentType, preferences.type);
        const metadata = new RepresentationMetadata_1.RepresentationMetadata(representation.metadata, contentType);
        return { ...representation, metadata };
    }
    async handleSafe(args) {
        return this.handle(args);
    }
    /**
     * Find a replacement content type that matches the preferences,
     * or throws an error if none was found.
     */
    getReplacementType(contentType = 'unknown', preferred = {}) {
        const supported = Object.keys(this.contentTypeMap)
            .filter((type) => ConversionUtil_1.matchesMediaType(contentType, type))
            .map((type) => this.contentTypeMap[type]);
        const match = ConversionUtil_1.getConversionTarget(Object.assign({}, ...supported), preferred);
        if (!match) {
            throw new NotImplementedHttpError_1.NotImplementedHttpError(`Cannot convert from ${contentType} to ${Object.keys(preferred)}`);
        }
        return match;
    }
}
exports.ContentTypeReplacer = ContentTypeReplacer;
//# sourceMappingURL=ContentTypeReplacer.js.map