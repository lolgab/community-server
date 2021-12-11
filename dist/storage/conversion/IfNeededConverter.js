"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IfNeededConverter = void 0;
const LogUtil_1 = require("../../logging/LogUtil");
const InternalServerError_1 = require("../../util/errors/InternalServerError");
const UnsupportedAsyncHandler_1 = require("../../util/handlers/UnsupportedAsyncHandler");
const ConversionUtil_1 = require("./ConversionUtil");
const RepresentationConverter_1 = require("./RepresentationConverter");
const EMPTY_CONVERTER = new UnsupportedAsyncHandler_1.UnsupportedAsyncHandler('The content type does not match the preferences');
/**
 * A {@link RepresentationConverter} that only converts representations
 * that are not compatible with the preferences.
 */
class IfNeededConverter extends RepresentationConverter_1.RepresentationConverter {
    constructor(converter = EMPTY_CONVERTER) {
        super();
        this.logger = LogUtil_1.getLoggerFor(this);
        this.converter = converter;
    }
    async canHandle(args) {
        if (this.needsConversion(args)) {
            await this.converter.canHandle(args);
        }
    }
    async handle(args) {
        return !this.needsConversion(args) ? args.representation : this.convert(args, false);
    }
    async handleSafe(args) {
        return !this.needsConversion(args) ? args.representation : this.convert(args, true);
    }
    needsConversion({ identifier, representation, preferences }) {
        // No conversion is needed if there are any matches for the provided content type
        const { contentType } = representation.metadata;
        if (!contentType) {
            throw new InternalServerError_1.InternalServerError('Content-Type is required for data conversion.');
        }
        const noMatchingMediaType = !ConversionUtil_1.matchesMediaPreferences(contentType, preferences.type);
        if (noMatchingMediaType) {
            this.logger.debug(`Conversion needed for ${identifier
                .path} from ${contentType} to satisfy ${!preferences.type ?
                '""' :
                Object.entries(preferences.type).map(([value, weight]) => `${value};q=${weight}`).join(', ')}`);
        }
        return noMatchingMediaType;
    }
    async convert(args, safely) {
        const converted = await (safely ? this.converter.handleSafe(args) : this.converter.handle(args));
        this.logger.info(`Converted representation for ${args.identifier
            .path} from ${args.representation.metadata.contentType} to ${converted.metadata.contentType}`);
        return converted;
    }
}
exports.IfNeededConverter = IfNeededConverter;
//# sourceMappingURL=IfNeededConverter.js.map