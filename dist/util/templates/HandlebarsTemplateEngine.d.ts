/// <reference types="node" />
import type { TemplateEngine, Template } from './TemplateEngine';
import Dict = NodeJS.Dict;
/**
 * Fills in Handlebars templates.
 */
export declare class HandlebarsTemplateEngine<T extends Dict<any> = Dict<any>> implements TemplateEngine<T> {
    private readonly applyTemplate;
    /**
     * @param template - The default template @range {json}
     */
    constructor(template?: Template);
    render(contents: T): Promise<string>;
    render<TCustom = T>(contents: TCustom, template: Template): Promise<string>;
}
