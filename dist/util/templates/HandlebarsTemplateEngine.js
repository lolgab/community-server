"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandlebarsTemplateEngine = void 0;
const handlebars_1 = require("handlebars");
const TemplateEngine_1 = require("./TemplateEngine");
/**
 * Fills in Handlebars templates.
 */
class HandlebarsTemplateEngine {
    /**
     * @param template - The default template @range {json}
     */
    constructor(template) {
        this.applyTemplate = TemplateEngine_1.readTemplate(template)
            .then((templateString) => handlebars_1.compile(templateString));
    }
    async render(contents, template) {
        const applyTemplate = template ? handlebars_1.compile(await TemplateEngine_1.readTemplate(template)) : await this.applyTemplate;
        return applyTemplate(contents);
    }
}
exports.HandlebarsTemplateEngine = HandlebarsTemplateEngine;
//# sourceMappingURL=HandlebarsTemplateEngine.js.map