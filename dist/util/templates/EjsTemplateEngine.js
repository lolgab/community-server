"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EjsTemplateEngine = void 0;
const ejs_1 = require("ejs");
const TemplateEngine_1 = require("./TemplateEngine");
/**
 * Fills in EJS templates.
 */
class EjsTemplateEngine {
    /**
     * @param template - The default template @range {json}
     */
    constructor(template) {
        // EJS requires the `filename` parameter to be able to include partial templates
        const filename = TemplateEngine_1.getTemplateFilePath(template);
        this.applyTemplate = TemplateEngine_1.readTemplate(template)
            .then((templateString) => ejs_1.compile(templateString, { filename }));
    }
    async render(contents, template) {
        const options = { ...contents, filename: TemplateEngine_1.getTemplateFilePath(template) };
        return template ? ejs_1.render(await TemplateEngine_1.readTemplate(template), options) : (await this.applyTemplate)(options);
    }
}
exports.EjsTemplateEngine = EjsTemplateEngine;
//# sourceMappingURL=EjsTemplateEngine.js.map