"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OwnerPermissionReader = void 0;
const Credentials_1 = require("../authentication/Credentials");
const LogUtil_1 = require("../logging/LogUtil");
const ErrorUtil_1 = require("../util/errors/ErrorUtil");
const NotImplementedHttpError_1 = require("../util/errors/NotImplementedHttpError");
const PermissionReader_1 = require("./PermissionReader");
/**
 * Allows control access if the request is being made by the owner of the pod containing the resource.
 */
class OwnerPermissionReader extends PermissionReader_1.PermissionReader {
    constructor(accountStore, aclStrategy) {
        super();
        this.logger = LogUtil_1.getLoggerFor(this);
        this.accountStore = accountStore;
        this.aclStrategy = aclStrategy;
    }
    async handle(input) {
        try {
            await this.ensurePodOwner(input);
        }
        catch (error) {
            this.logger.debug(`No pod owner Control permissions: ${ErrorUtil_1.createErrorMessage(error)}`);
            return {};
        }
        this.logger.debug(`Granting Control permissions to owner on ${input.identifier.path}`);
        return { [Credentials_1.CredentialGroup.agent]: {
                read: true,
                write: true,
                append: true,
                create: true,
                delete: true,
                control: true,
            } };
    }
    /**
     * Verify that all conditions are fulfilled to give the owner access.
     */
    async ensurePodOwner({ credentials, identifier }) {
        var _a;
        // We only check ownership when an ACL resource is targeted to reduce the number of storage calls
        if (!this.aclStrategy.isAuxiliaryIdentifier(identifier)) {
            throw new NotImplementedHttpError_1.NotImplementedHttpError('Exception is only granted when accessing ACL resources');
        }
        if (!((_a = credentials.agent) === null || _a === void 0 ? void 0 : _a.webId)) {
            throw new NotImplementedHttpError_1.NotImplementedHttpError('Only authenticated agents could be owners');
        }
        let settings;
        try {
            settings = await this.accountStore.getSettings(credentials.agent.webId);
        }
        catch {
            throw new NotImplementedHttpError_1.NotImplementedHttpError('No account registered for this WebID');
        }
        if (!settings.podBaseUrl) {
            throw new NotImplementedHttpError_1.NotImplementedHttpError('This agent has no pod on the server');
        }
        if (!identifier.path.startsWith(settings.podBaseUrl)) {
            throw new NotImplementedHttpError_1.NotImplementedHttpError('Not targeting the pod owned by this agent');
        }
    }
}
exports.OwnerPermissionReader = OwnerPermissionReader;
//# sourceMappingURL=OwnerPermissionReader.js.map