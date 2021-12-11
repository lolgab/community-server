"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionHttpHandler = void 0;
const NotImplementedHttpError_1 = require("../../util/errors/NotImplementedHttpError");
const StreamUtil_1 = require("../../util/StreamUtil");
const InteractionHandler_1 = require("./email-password/handler/InteractionHandler");
/**
 * Simple InteractionHttpHandler that sends the session accountId to the InteractionCompleter as webId.
 */
class SessionHttpHandler extends InteractionHandler_1.InteractionHandler {
    async handle({ operation, oidcInteraction }) {
        if (!(oidcInteraction === null || oidcInteraction === void 0 ? void 0 : oidcInteraction.session)) {
            throw new NotImplementedHttpError_1.NotImplementedHttpError('Only interactions with a valid session are supported.');
        }
        const { remember } = await StreamUtil_1.readJsonStream(operation.body.data);
        return {
            type: 'complete',
            details: { webId: oidcInteraction.session.accountId, shouldRemember: Boolean(remember) },
        };
    }
}
exports.SessionHttpHandler = SessionHttpHandler;
//# sourceMappingURL=SessionHttpHandler.js.map