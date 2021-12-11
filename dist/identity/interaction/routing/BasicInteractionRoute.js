"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicInteractionRoute = void 0;
const BadRequestHttpError_1 = require("../../../util/errors/BadRequestHttpError");
const ErrorUtil_1 = require("../../../util/errors/ErrorUtil");
const InternalServerError_1 = require("../../../util/errors/InternalServerError");
const PathUtil_1 = require("../../../util/PathUtil");
/**
 * Default implementation of the InteractionRoute.
 * See function comments for specifics.
 */
class BasicInteractionRoute {
    /**
     * @param route - Regex to match this route.
     * @param viewTemplates - Templates to render on GET requests.
     *                        Keys are content-types, values paths to a template.
     * @param handler - Handler to call on POST requests.
     * @param prompt - In case of requests to the IDP entry point, the session prompt will be compared to this.
     * @param responseTemplates - Templates to render as a response to POST requests when required.
     *                            Keys are content-types, values paths to a template.
     * @param controls - Controls to add to the response JSON.
     *                   The keys will be copied and the values will be converted to full URLs.
     */
    constructor(route, viewTemplates, handler, prompt, responseTemplates = {}, controls = {}) {
        this.route = new RegExp(route, 'u');
        this.viewTemplates = viewTemplates;
        this.handler = handler;
        this.prompt = prompt;
        this.responseTemplates = responseTemplates;
        this.controls = controls;
    }
    /**
     * Returns the stored controls.
     */
    getControls() {
        return this.controls;
    }
    /**
     * Checks support by comparing the prompt if the path targets the base URL,
     * and otherwise comparing with the stored route regular expression.
     */
    supportsPath(path, prompt) {
        // In case the request targets the IDP entry point the prompt determines where to go
        if (PathUtil_1.trimTrailingSlashes(path).length === 0 && prompt) {
            return this.prompt === prompt;
        }
        return this.route.test(path);
    }
    /**
     * GET requests return a default response result.
     * POST requests return the InteractionHandler result.
     * InteractionHandler errors will be converted into response results.
     *
     * All results will be appended with the matching template paths.
     *
     * Will error for other methods
     */
    async handleOperation(operation, oidcInteraction) {
        switch (operation.method) {
            case 'GET':
                return { type: 'response', templateFiles: this.viewTemplates };
            case 'POST':
                try {
                    const result = await this.handler.handleSafe({ operation, oidcInteraction });
                    return { ...result, templateFiles: this.responseTemplates };
                }
                catch (err) {
                    const error = ErrorUtil_1.isError(err) ? err : new InternalServerError_1.InternalServerError(ErrorUtil_1.createErrorMessage(err));
                    // Potentially render the error in the view
                    return { type: 'error', error, templateFiles: this.viewTemplates };
                }
            default:
                throw new BadRequestHttpError_1.BadRequestHttpError(`Unsupported request: ${operation.method} ${operation.target.path}`);
        }
    }
}
exports.BasicInteractionRoute = BasicInteractionRoute;
//# sourceMappingURL=BasicInteractionRoute.js.map