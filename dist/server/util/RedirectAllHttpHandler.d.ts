import type { TargetExtractor } from '../../http/input/identifier/TargetExtractor';
import type { ResponseWriter } from '../../http/output/ResponseWriter';
import type { HttpHandlerInput } from '../HttpHandler';
import { HttpHandler } from '../HttpHandler';
export interface RedirectAllHttpHandlerArgs {
    baseUrl: string;
    target: string;
    targetExtractor: TargetExtractor;
    responseWriter: ResponseWriter;
}
/**
 * Will redirect all incoming requests to the given target.
 * In case the incoming request already has the correct target,
 * the `canHandle` call will reject the input.
 */
export declare class RedirectAllHttpHandler extends HttpHandler {
    private readonly baseUrl;
    private readonly target;
    private readonly targetExtractor;
    private readonly responseWriter;
    constructor(args: RedirectAllHttpHandlerArgs);
    canHandle({ request }: HttpHandlerInput): Promise<void>;
    handle({ response }: HttpHandlerInput): Promise<void>;
}
