"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginHandler = void 0;
const assert_1 = __importDefault(require("assert"));
const LogUtil_1 = require("../../../../logging/LogUtil");
const BadRequestHttpError_1 = require("../../../../util/errors/BadRequestHttpError");
const StreamUtil_1 = require("../../../../util/StreamUtil");
const InteractionHandler_1 = require("./InteractionHandler");
/**
 * Handles the submission of the Login Form and logs the user in.
 */
class LoginHandler extends InteractionHandler_1.InteractionHandler {
    constructor(accountStore) {
        super();
        this.logger = LogUtil_1.getLoggerFor(this);
        this.accountStore = accountStore;
    }
    async handle({ operation }) {
        const { email, password, remember } = await this.parseInput(operation);
        // Try to log in, will error if email/password combination is invalid
        const webId = await this.accountStore.authenticate(email, password);
        const settings = await this.accountStore.getSettings(webId);
        if (!settings.useIdp) {
            // There is an account but is not used for identification with the IDP
            throw new BadRequestHttpError_1.BadRequestHttpError('This server is not an identity provider for this account.');
        }
        this.logger.debug(`Logging in user ${email}`);
        return {
            type: 'complete',
            details: { webId, shouldRemember: remember },
        };
    }
    /**
     * Parses and validates the input form data.
     * Will throw an error in case something is wrong.
     * All relevant data that was correct up to that point will be prefilled.
     */
    async parseInput(operation) {
        const prefilled = {};
        const { email, password, remember } = await StreamUtil_1.readJsonStream(operation.body.data);
        assert_1.default(typeof email === 'string' && email.length > 0, 'Email required');
        prefilled.email = email;
        assert_1.default(typeof password === 'string' && password.length > 0, 'Password required');
        return { email, password, remember: Boolean(remember) };
    }
}
exports.LoginHandler = LoginHandler;
//# sourceMappingURL=LoginHandler.js.map