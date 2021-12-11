import type { Operation } from '../../../http/Operation';
import type { InteractionHandler, Interaction } from '../email-password/handler/InteractionHandler';
import type { InteractionRoute, TemplatedInteractionResult } from './InteractionRoute';
/**
 * Default implementation of the InteractionRoute.
 * See function comments for specifics.
 */
export declare class BasicInteractionRoute implements InteractionRoute {
    readonly route: RegExp;
    readonly handler: InteractionHandler;
    readonly viewTemplates: Record<string, string>;
    readonly prompt?: string;
    readonly responseTemplates: Record<string, string>;
    readonly controls: Record<string, string>;
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
    constructor(route: string, viewTemplates: Record<string, string>, handler: InteractionHandler, prompt?: string, responseTemplates?: Record<string, string>, controls?: Record<string, string>);
    /**
     * Returns the stored controls.
     */
    getControls(): Record<string, string>;
    /**
     * Checks support by comparing the prompt if the path targets the base URL,
     * and otherwise comparing with the stored route regular expression.
     */
    supportsPath(path: string, prompt?: string): boolean;
    /**
     * GET requests return a default response result.
     * POST requests return the InteractionHandler result.
     * InteractionHandler errors will be converted into response results.
     *
     * All results will be appended with the matching template paths.
     *
     * Will error for other methods
     */
    handleOperation(operation: Operation, oidcInteraction?: Interaction): Promise<TemplatedInteractionResult>;
}
