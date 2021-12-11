"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuxiliaryReader = void 0;
const LogUtil_1 = require("../logging/LogUtil");
const NotImplementedHttpError_1 = require("../util/errors/NotImplementedHttpError");
const PermissionReader_1 = require("./PermissionReader");
/**
 * A PermissionReader for auxiliary resources such as acl or shape resources.
 * By default, the access permissions of an auxiliary resource depend on those of its subject resource.
 * This authorizer calls the source authorizer with the identifier of the subject resource.
 */
class AuxiliaryReader extends PermissionReader_1.PermissionReader {
    constructor(resourceReader, auxiliaryStrategy) {
        super();
        this.logger = LogUtil_1.getLoggerFor(this);
        this.resourceReader = resourceReader;
        this.auxiliaryStrategy = auxiliaryStrategy;
    }
    async canHandle(auxiliaryAuth) {
        const resourceAuth = this.getRequiredAuthorization(auxiliaryAuth);
        return this.resourceReader.canHandle(resourceAuth);
    }
    async handle(auxiliaryAuth) {
        const resourceAuth = this.getRequiredAuthorization(auxiliaryAuth);
        this.logger.debug(`Checking auth request for ${auxiliaryAuth.identifier.path} on ${resourceAuth.identifier.path}`);
        return this.resourceReader.handle(resourceAuth);
    }
    async handleSafe(auxiliaryAuth) {
        const resourceAuth = this.getRequiredAuthorization(auxiliaryAuth);
        this.logger.debug(`Checking auth request for ${auxiliaryAuth.identifier.path} to ${resourceAuth.identifier.path}`);
        return this.resourceReader.handleSafe(resourceAuth);
    }
    getRequiredAuthorization(auxiliaryAuth) {
        if (!this.auxiliaryStrategy.isAuxiliaryIdentifier(auxiliaryAuth.identifier)) {
            throw new NotImplementedHttpError_1.NotImplementedHttpError('AuxiliaryAuthorizer only supports auxiliary resources.');
        }
        if (this.auxiliaryStrategy.usesOwnAuthorization(auxiliaryAuth.identifier)) {
            throw new NotImplementedHttpError_1.NotImplementedHttpError('Auxiliary resource uses its own permissions.');
        }
        return {
            ...auxiliaryAuth,
            identifier: this.auxiliaryStrategy.getSubjectIdentifier(auxiliaryAuth.identifier),
        };
    }
}
exports.AuxiliaryReader = AuxiliaryReader;
//# sourceMappingURL=AuxiliaryReader.js.map