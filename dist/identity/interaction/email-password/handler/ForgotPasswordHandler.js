"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgotPasswordHandler = void 0;
const assert_1 = __importDefault(require("assert"));
const LogUtil_1 = require("../../../../logging/LogUtil");
const PathUtil_1 = require("../../../../util/PathUtil");
const StreamUtil_1 = require("../../../../util/StreamUtil");
const InteractionHandler_1 = require("./InteractionHandler");
/**
 * Handles the submission of the ForgotPassword form
 */
class ForgotPasswordHandler extends InteractionHandler_1.InteractionHandler {
    constructor(args) {
        super();
        this.logger = LogUtil_1.getLoggerFor(this);
        this.accountStore = args.accountStore;
        this.baseUrl = PathUtil_1.ensureTrailingSlash(args.baseUrl);
        this.idpPath = args.idpPath;
        this.templateEngine = args.templateEngine;
        this.emailSender = args.emailSender;
    }
    async handle({ operation }) {
        // Validate incoming data
        const { email } = await StreamUtil_1.readJsonStream(operation.body.data);
        assert_1.default(typeof email === 'string' && email.length > 0, 'Email required');
        await this.resetPassword(email);
        return { type: 'response', details: { email } };
    }
    /**
     * Generates a record to reset the password for the given email address and then mails it.
     * In case there is no account, no error wil be thrown for privacy reasons.
     * Instead nothing will happen instead.
     */
    async resetPassword(email) {
        let recordId;
        try {
            recordId = await this.accountStore.generateForgotPasswordRecord(email);
        }
        catch {
            // Don't emit an error for privacy reasons
            this.logger.warn(`Password reset request for unknown email ${email}`);
            return;
        }
        await this.sendResetMail(recordId, email);
    }
    /**
     * Generates the link necessary for resetting the password and mails it to the given email address.
     */
    async sendResetMail(recordId, email) {
        this.logger.info(`Sending password reset to ${email}`);
        const resetLink = PathUtil_1.joinUrl(this.baseUrl, this.idpPath, `resetpassword/${recordId}`);
        const renderedEmail = await this.templateEngine.render({ resetLink });
        await this.emailSender.handleSafe({
            recipient: email,
            subject: 'Reset your password',
            text: `To reset your password, go to this link: ${resetLink}`,
            html: renderedEmail,
        });
    }
}
exports.ForgotPasswordHandler = ForgotPasswordHandler;
//# sourceMappingURL=ForgotPasswordHandler.js.map