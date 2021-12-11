"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordHandler = void 0;
const assert_1 = __importDefault(require("assert"));
const LogUtil_1 = require("../../../../logging/LogUtil");
const StreamUtil_1 = require("../../../../util/StreamUtil");
const EmailPasswordUtil_1 = require("../EmailPasswordUtil");
const InteractionHandler_1 = require("./InteractionHandler");
/**
 * Handles the submission of the ResetPassword form:
 * this is the form that is linked in the reset password email.
 */
class ResetPasswordHandler extends InteractionHandler_1.InteractionHandler {
    constructor(accountStore) {
        super();
        this.logger = LogUtil_1.getLoggerFor(this);
        this.accountStore = accountStore;
    }
    async handle({ operation }) {
        var _a;
        // Extract record ID from request URL
        const recordId = (_a = /\/([^/]+)$/u.exec(operation.target.path)) === null || _a === void 0 ? void 0 : _a[1];
        // Validate input data
        const { password, confirmPassword } = await StreamUtil_1.readJsonStream(operation.body.data);
        assert_1.default(typeof recordId === 'string' && recordId.length > 0, 'Invalid request. Open the link from your email again');
        EmailPasswordUtil_1.assertPassword(password, confirmPassword);
        await this.resetPassword(recordId, password);
        return { type: 'response' };
    }
    /**
     * Resets the password for the account associated with the given recordId.
     */
    async resetPassword(recordId, newPassword) {
        const email = await this.accountStore.getForgotPasswordRecord(recordId);
        assert_1.default(email, 'This reset password link is no longer valid.');
        await this.accountStore.deleteForgotPasswordRecord(recordId);
        await this.accountStore.changePassword(email, newPassword);
        this.logger.debug(`Resetting password for user ${email}`);
    }
}
exports.ResetPasswordHandler = ResetPasswordHandler;
//# sourceMappingURL=ResetPasswordHandler.js.map