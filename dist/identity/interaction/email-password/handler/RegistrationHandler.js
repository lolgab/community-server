"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationHandler = void 0;
const LogUtil_1 = require("../../../../logging/LogUtil");
const StreamUtil_1 = require("../../../../util/StreamUtil");
const InteractionHandler_1 = require("./InteractionHandler");
/**
 * Supports registration based on the `RegistrationManager` behaviour.
 */
class RegistrationHandler extends InteractionHandler_1.InteractionHandler {
    constructor(registrationManager) {
        super();
        this.logger = LogUtil_1.getLoggerFor(this);
        this.registrationManager = registrationManager;
    }
    async handle({ operation }) {
        const data = await StreamUtil_1.readJsonStream(operation.body.data);
        const validated = this.registrationManager.validateInput(data, false);
        const details = await this.registrationManager.register(validated, false);
        return { type: 'response', details };
    }
}
exports.RegistrationHandler = RegistrationHandler;
//# sourceMappingURL=RegistrationHandler.js.map