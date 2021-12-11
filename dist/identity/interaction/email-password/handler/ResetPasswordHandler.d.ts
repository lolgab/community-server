import type { AccountStore } from '../storage/AccountStore';
import type { InteractionResponseResult, InteractionHandlerInput } from './InteractionHandler';
import { InteractionHandler } from './InteractionHandler';
/**
 * Handles the submission of the ResetPassword form:
 * this is the form that is linked in the reset password email.
 */
export declare class ResetPasswordHandler extends InteractionHandler {
    protected readonly logger: import("../../../..").Logger;
    private readonly accountStore;
    constructor(accountStore: AccountStore);
    handle({ operation }: InteractionHandlerInput): Promise<InteractionResponseResult>;
    /**
     * Resets the password for the account associated with the given recordId.
     */
    private resetPassword;
}
