"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstantConverter = void 0;
const fs_1 = require("fs");
const BasicRepresentation_1 = require("../../http/representation/BasicRepresentation");
const NotImplementedHttpError_1 = require("../../util/errors/NotImplementedHttpError");
const PathUtil_1 = require("../../util/PathUtil");
const ConversionUtil_1 = require("./ConversionUtil");
const RepresentationConverter_1 = require("./RepresentationConverter");
/**
 * A {@link RepresentationConverter} that ensures
 * a representation for a certain content type is available.
 *
 * Representations of the same content type are served as is;
 * others are replaced by a constant document.
 *
 * This can for example be used to serve an index.html file,
 * which could then interactively load another representation.
 *
 * Options default to the most permissive values when not defined.
 */
class ConstantConverter extends RepresentationConverter_1.RepresentationConverter {
    /**
     * Creates a new constant converter.
     *
     * @param filePath - The path to the constant representation.
     * @param contentType - The content type of the constant representation.
     * @param options - Extra options for the converter.
     */
    constructor(filePath, contentType, options = {}) {
        var _a, _b, _c, _d, _e;
        super();
        this.filePath = filePath;
        this.contentType = contentType;
        this.options = {
            container: (_a = options.container) !== null && _a !== void 0 ? _a : true,
            document: (_b = options.document) !== null && _b !== void 0 ? _b : true,
            minQuality: (_c = options.minQuality) !== null && _c !== void 0 ? _c : 0,
            enabledMediaRanges: (_d = options.enabledMediaRanges) !== null && _d !== void 0 ? _d : ['*/*'],
            disabledMediaRanges: (_e = options.disabledMediaRanges) !== null && _e !== void 0 ? _e : [],
        };
    }
    async canHandle({ identifier, preferences, representation }) {
        var _a;
        // Do not replace the representation if there is no preference for our content type
        if (!preferences.type) {
            throw new NotImplementedHttpError_1.NotImplementedHttpError('No content type preferences specified');
        }
        // Do not replace the representation of unsupported resource types
        const isContainer = PathUtil_1.isContainerIdentifier(identifier);
        if (isContainer && !this.options.container) {
            throw new NotImplementedHttpError_1.NotImplementedHttpError('Containers are not supported');
        }
        if (!isContainer && !this.options.document) {
            throw new NotImplementedHttpError_1.NotImplementedHttpError('Documents are not supported');
        }
        // Do not replace the representation if the preference weight is too low
        const quality = ConversionUtil_1.getTypeWeight(this.contentType, ConversionUtil_1.cleanPreferences({ ...preferences.type, '*/*': 0 }));
        if (quality === 0) {
            throw new NotImplementedHttpError_1.NotImplementedHttpError(`No preference for ${this.contentType}`);
        }
        else if (quality < this.options.minQuality) {
            throw new NotImplementedHttpError_1.NotImplementedHttpError(`Preference is lower than the specified minimum quality`);
        }
        const sourceContentType = (_a = representation.metadata.contentType) !== null && _a !== void 0 ? _a : '';
        // Do not replace the representation if it already has our content type
        if (ConversionUtil_1.matchesMediaType(sourceContentType, this.contentType)) {
            throw new NotImplementedHttpError_1.NotImplementedHttpError(`Representation is already ${this.contentType}`);
        }
        // Only replace the representation if it matches the media range settings
        if (!this.options.enabledMediaRanges.some((type) => ConversionUtil_1.matchesMediaType(sourceContentType, type))) {
            throw new NotImplementedHttpError_1.NotImplementedHttpError(`${sourceContentType} is not one of the enabled media types.`);
        }
        if (this.options.disabledMediaRanges.some((type) => ConversionUtil_1.matchesMediaType(sourceContentType, type))) {
            throw new NotImplementedHttpError_1.NotImplementedHttpError(`${sourceContentType} is one of the disabled media types.`);
        }
    }
    async handle({ representation }) {
        // Ignore the original representation
        representation.data.destroy();
        // Create a new representation from the constant file
        const data = fs_1.createReadStream(this.filePath, 'utf8');
        return new BasicRepresentation_1.BasicRepresentation(data, representation.metadata, this.contentType);
    }
}
exports.ConstantConverter = ConstantConverter;
//# sourceMappingURL=ConstantConverter.js.map