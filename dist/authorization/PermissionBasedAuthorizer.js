"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionBasedAuthorizer = void 0;
const LogUtil_1 = require("../logging/LogUtil");
const ForbiddenHttpError_1 = require("../util/errors/ForbiddenHttpError");
const UnauthorizedHttpError_1 = require("../util/errors/UnauthorizedHttpError");
const Authorizer_1 = require("./Authorizer");
/**
 * Authorizer that bases its decision on the output it gets from its PermissionReader.
 * For each permission it checks if the reader allows that for at least one credential type,
 * if yes authorization is granted.
 * `undefined` values for reader results are interpreted as `false`.
 */
class PermissionBasedAuthorizer extends Authorizer_1.Authorizer {
    constructor() {
        super(...arguments);
        this.logger = LogUtil_1.getLoggerFor(this);
    }
    async handle(input) {
        var _a;
        const { credentials, modes, identifier, permissionSet } = input;
        const modeString = [...modes].join(',');
        this.logger.debug(`Checking if ${(_a = credentials.agent) === null || _a === void 0 ? void 0 : _a.webId} has ${modeString} permissions for ${identifier.path}`);
        for (const mode of modes) {
            this.requireModePermission(credentials, permissionSet, mode);
        }
        this.logger.debug(`${JSON.stringify(credentials)} has ${modeString} permissions for ${identifier.path}`);
    }
    /**
     * Ensures that at least one of the credentials provides permissions for the given mode.
     * Throws a {@link ForbiddenHttpError} or {@link UnauthorizedHttpError} depending on the credentials
     * if access is not allowed.
     * @param credentials - Credentials that require access.
     * @param permissionSet - PermissionSet describing the available permissions of the credentials.
     * @param mode - Which mode is requested.
     */
    requireModePermission(credentials, permissionSet, mode) {
        if (!this.hasModePermission(permissionSet, mode)) {
            if (this.isAuthenticated(credentials)) {
                this.logger.warn(`Agent ${credentials.agent.webId} has no ${mode} permissions`);
                throw new ForbiddenHttpError_1.ForbiddenHttpError();
            }
            else {
                // Solid, §2.1: "When a client does not provide valid credentials when requesting a resource that requires it,
                // the data pod MUST send a response with a 401 status code (unless 404 is preferred for security reasons)."
                // https://solid.github.io/specification/protocol#http-server
                this.logger.warn(`Unauthenticated agent has no ${mode} permissions`);
                throw new UnauthorizedHttpError_1.UnauthorizedHttpError();
            }
        }
    }
    /**
     * Checks if one of the Permissions in the PermissionSet grants permission to use the given mode.
     */
    hasModePermission(permissionSet, mode) {
        for (const permissions of Object.values(permissionSet)) {
            if (permissions[mode]) {
                return true;
            }
        }
        return false;
    }
    /**
     * Checks whether the agent is authenticated (logged in) or not (public/anonymous).
     * @param credentials - Credentials to check.
     */
    isAuthenticated(credentials) {
        var _a;
        return typeof ((_a = credentials.agent) === null || _a === void 0 ? void 0 : _a.webId) === 'string';
    }
}
exports.PermissionBasedAuthorizer = PermissionBasedAuthorizer;
//# sourceMappingURL=PermissionBasedAuthorizer.js.map