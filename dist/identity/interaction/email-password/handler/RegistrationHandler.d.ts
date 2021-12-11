import type { RegistrationManager, RegistrationResponse } from '../util/RegistrationManager';
import type { InteractionResponseResult, InteractionHandlerInput } from './InteractionHandler';
import { InteractionHandler } from './InteractionHandler';
/**
 * Supports registration based on the `RegistrationManager` behaviour.
 */
export declare class RegistrationHandler extends InteractionHandler {
    protected readonly logger: import("../../../..").Logger;
    private readonly registrationManager;
    constructor(registrationManager: RegistrationManager);
    handle({ operation }: InteractionHandlerInput): Promise<InteractionResponseResult<RegistrationResponse>>;
}
