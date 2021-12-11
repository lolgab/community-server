"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypedRepresentationConverter = void 0;
const NotImplementedHttpError_1 = require("../../util/errors/NotImplementedHttpError");
const ConversionUtil_1 = require("./ConversionUtil");
const RepresentationConverter_1 = require("./RepresentationConverter");
async function toValuePreferences(arg) {
    const resolved = await arg;
    if (typeof resolved === 'string') {
        return { [resolved]: 1 };
    }
    if (Array.isArray(resolved)) {
        return Object.fromEntries(resolved.map((type) => [type, 1]));
    }
    return resolved;
}
/**
 * A {@link RepresentationConverter} that allows requesting the supported types.
 */
class TypedRepresentationConverter extends RepresentationConverter_1.RepresentationConverter {
    constructor(inputTypes = {}, outputTypes = {}) {
        super();
        this.inputTypes = toValuePreferences(inputTypes);
        this.outputTypes = toValuePreferences(outputTypes);
    }
    /**
     * Gets the supported input content types for this converter, mapped to a numerical priority.
     */
    async getInputTypes() {
        return this.inputTypes;
    }
    /**
     * Gets the supported output content types for this converter, mapped to a numerical quality.
     */
    async getOutputTypes() {
        return this.outputTypes;
    }
    /**
     * Determines whether the given conversion request is supported,
     * given the available content type conversions:
     *  - Checks if there is a content type for the input.
     *  - Checks if the input type is supported by the parser.
     *  - Checks if the parser can produce one of the preferred output types.
     * Throws an error with details if conversion is not possible.
     */
    async canHandle(args) {
        var _a;
        const types = [this.getInputTypes(), this.getOutputTypes()];
        const { contentType } = args.representation.metadata;
        if (!contentType) {
            throw new NotImplementedHttpError_1.NotImplementedHttpError('Can not convert data without a Content-Type.');
        }
        const [inputTypes, outputTypes] = await Promise.all(types);
        const outputPreferences = (_a = args.preferences.type) !== null && _a !== void 0 ? _a : {};
        if (ConversionUtil_1.getTypeWeight(contentType, inputTypes) === 0 || !ConversionUtil_1.getConversionTarget(outputTypes, outputPreferences)) {
            throw new NotImplementedHttpError_1.NotImplementedHttpError(`Cannot convert from ${contentType} to ${Object.keys(outputPreferences)}, only from ${Object.keys(inputTypes)} to ${Object.keys(outputTypes)}.`);
        }
    }
}
exports.TypedRepresentationConverter = TypedRepresentationConverter;
//# sourceMappingURL=TypedRepresentationConverter.js.map