import type { AccountStore } from '../storage/AccountStore';
import { InteractionHandler } from './InteractionHandler';
import type { InteractionCompleteResult, InteractionHandlerInput } from './InteractionHandler';
/**
 * Handles the submission of the Login Form and logs the user in.
 */
export declare class LoginHandler extends InteractionHandler {
    protected readonly logger: import("../../../..").Logger;
    private readonly accountStore;
    constructor(accountStore: AccountStore);
    handle({ operation }: InteractionHandlerInput): Promise<InteractionCompleteResult>;
    /**
     * Parses and validates the input form data.
     * Will throw an error in case something is wrong.
     * All relevant data that was correct up to that point will be prefilled.
     */
    private parseInput;
}
