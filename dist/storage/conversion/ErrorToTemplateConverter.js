"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorToTemplateConverter = void 0;
const assert_1 = __importDefault(require("assert"));
const BasicRepresentation_1 = require("../../http/representation/BasicRepresentation");
const ContentTypes_1 = require("../../util/ContentTypes");
const HttpError_1 = require("../../util/errors/HttpError");
const PathUtil_1 = require("../../util/PathUtil");
const StreamUtil_1 = require("../../util/StreamUtil");
const TypedRepresentationConverter_1 = require("./TypedRepresentationConverter");
const DEFAULT_TEMPLATE_OPTIONS = {
    mainTemplatePath: `${PathUtil_1.modulePathPlaceholder}templates/error/main.md.hbs`,
    codeTemplatesPath: `${PathUtil_1.modulePathPlaceholder}templates/error/descriptions/`,
    extension: '.md.hbs',
    contentType: 'text/markdown',
};
/**
 * Serializes an Error by filling in the provided template.
 * Content-type is based on the constructor parameter.
 *
 * In case the input Error has an `errorCode` value,
 * the converter will look in the `descriptions` for a file
 * with the exact same name as that error code + `extension`.
 * The templating engine will then be applied to that file.
 * That result will be passed as an additional parameter to the main templating call,
 * using the variable `codeMessage`.
 */
class ErrorToTemplateConverter extends TypedRepresentationConverter_1.TypedRepresentationConverter {
    constructor(templateEngine, templateOptions) {
        var _a;
        super(ContentTypes_1.INTERNAL_ERROR, (_a = templateOptions === null || templateOptions === void 0 ? void 0 : templateOptions.contentType) !== null && _a !== void 0 ? _a : DEFAULT_TEMPLATE_OPTIONS.contentType);
        // Workaround for https://github.com/LinkedSoftwareDependencies/Components.js/issues/20
        if (!templateOptions || Object.keys(templateOptions).length === 0) {
            templateOptions = DEFAULT_TEMPLATE_OPTIONS;
        }
        this.templateEngine = templateEngine;
        this.mainTemplatePath = templateOptions.mainTemplatePath;
        this.codeTemplatesPath = templateOptions.codeTemplatesPath;
        this.extension = templateOptions.extension;
        this.contentType = templateOptions.contentType;
    }
    async handle({ representation }) {
        var _a;
        const error = await StreamUtil_1.getSingleItem(representation.data);
        // Render the error description using an error-specific template
        let description;
        if (HttpError_1.HttpError.isInstance(error)) {
            try {
                const templateFile = `${error.errorCode}${this.extension}`;
                assert_1.default(/^[\w.-]+$/u.test(templateFile), 'Invalid error template name');
                description = await this.templateEngine.render((_a = error.details) !== null && _a !== void 0 ? _a : {}, { templateFile, templatePath: this.codeTemplatesPath });
            }
            catch {
                // In case no template is found, or rendering errors, we still want to convert
            }
        }
        // Render the main template, embedding the rendered error description
        const { name, message, stack } = error;
        const variables = { name, message, stack, description };
        const rendered = await this.templateEngine.render(variables, { templateFile: this.mainTemplatePath });
        return new BasicRepresentation_1.BasicRepresentation(rendered, representation.metadata, this.contentType);
    }
}
exports.ErrorToTemplateConverter = ErrorToTemplateConverter;
//# sourceMappingURL=ErrorToTemplateConverter.js.map