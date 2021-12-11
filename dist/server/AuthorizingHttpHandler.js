"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizingHttpHandler = void 0;
const LogUtil_1 = require("../logging/LogUtil");
const OperationHttpHandler_1 = require("./OperationHttpHandler");
/**
 * Handles all the necessary steps for an authorization.
 * Errors if authorization fails, otherwise passes the parameter to the operationHandler handler.
 * The following steps are executed:
 *  - Extracting credentials from the request.
 *  - Extracting the required permissions.
 *  - Reading the allowed permissions for the credentials.
 *  - Validating if this operation is allowed.
 */
class AuthorizingHttpHandler extends OperationHttpHandler_1.OperationHttpHandler {
    constructor(args) {
        super();
        this.logger = LogUtil_1.getLoggerFor(this);
        this.credentialsExtractor = args.credentialsExtractor;
        this.modesExtractor = args.modesExtractor;
        this.permissionReader = args.permissionReader;
        this.authorizer = args.authorizer;
        this.operationHandler = args.operationHandler;
    }
    async handle(input) {
        const { request, operation } = input;
        const credentials = await this.credentialsExtractor.handleSafe(request);
        this.logger.verbose(`Extracted credentials: ${JSON.stringify(credentials)}`);
        const modes = await this.modesExtractor.handleSafe(operation);
        this.logger.verbose(`Required modes are read: ${[...modes].join(',')}`);
        const permissionSet = await this.permissionReader.handleSafe({ credentials, identifier: operation.target });
        this.logger.verbose(`Available permissions are ${JSON.stringify(permissionSet)}`);
        try {
            await this.authorizer.handleSafe({ credentials, identifier: operation.target, modes, permissionSet });
            operation.permissionSet = permissionSet;
        }
        catch (error) {
            this.logger.verbose(`Authorization failed: ${error.message}`);
            throw error;
        }
        this.logger.verbose(`Authorization succeeded, calling source handler`);
        return this.operationHandler.handleSafe(input);
    }
}
exports.AuthorizingHttpHandler = AuthorizingHttpHandler;
//# sourceMappingURL=AuthorizingHttpHandler.js.map