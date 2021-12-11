import { InteractionHandler } from './email-password/handler/InteractionHandler';
import type { InteractionCompleteResult, InteractionHandlerInput } from './email-password/handler/InteractionHandler';
/**
 * Simple InteractionHttpHandler that sends the session accountId to the InteractionCompleter as webId.
 */
export declare class SessionHttpHandler extends InteractionHandler {
    handle({ operation, oidcInteraction }: InteractionHandlerInput): Promise<InteractionCompleteResult>;
}
