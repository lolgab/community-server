"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseEmailSender = void 0;
const nodemailer_1 = require("nodemailer");
const EmailSender_1 = require("./EmailSender");
/**
 * Sends e-mails using nodemailer.
 */
class BaseEmailSender extends EmailSender_1.EmailSender {
    constructor(args) {
        var _a;
        super();
        this.mailTransporter = nodemailer_1.createTransport(args.emailConfig);
        this.senderName = (_a = args.senderName) !== null && _a !== void 0 ? _a : 'Solid';
    }
    async handle({ recipient, subject, text, html }) {
        await this.mailTransporter.sendMail({
            from: this.senderName,
            to: recipient,
            subject,
            text,
            html,
        });
    }
}
exports.BaseEmailSender = BaseEmailSender;
//# sourceMappingURL=BaseEmailSender.js.map