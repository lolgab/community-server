import type { TemplateEngine } from '../../../../util/templates/TemplateEngine';
import type { EmailSender } from '../../util/EmailSender';
import type { AccountStore } from '../storage/AccountStore';
import { InteractionHandler } from './InteractionHandler';
import type { InteractionResponseResult, InteractionHandlerInput } from './InteractionHandler';
export interface ForgotPasswordHandlerArgs {
    accountStore: AccountStore;
    baseUrl: string;
    idpPath: string;
    templateEngine: TemplateEngine<{
        resetLink: string;
    }>;
    emailSender: EmailSender;
}
/**
 * Handles the submission of the ForgotPassword form
 */
export declare class ForgotPasswordHandler extends InteractionHandler {
    protected readonly logger: import("../../../..").Logger;
    private readonly accountStore;
    private readonly baseUrl;
    private readonly idpPath;
    private readonly templateEngine;
    private readonly emailSender;
    constructor(args: ForgotPasswordHandlerArgs);
    handle({ operation }: InteractionHandlerInput): Promise<InteractionResponseResult<{
        email: string;
    }>>;
    /**
     * Generates a record to reset the password for the given email address and then mails it.
     * In case there is no account, no error wil be thrown for privacy reasons.
     * Instead nothing will happen instead.
     */
    private resetPassword;
    /**
     * Generates the link necessary for resetting the password and mails it to the given email address.
     */
    private sendResetMail;
}
