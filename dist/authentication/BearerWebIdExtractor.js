"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BearerWebIdExtractor = void 0;
const access_token_verifier_1 = require("@solid/access-token-verifier");
const LogUtil_1 = require("../logging/LogUtil");
const BadRequestHttpError_1 = require("../util/errors/BadRequestHttpError");
const NotImplementedHttpError_1 = require("../util/errors/NotImplementedHttpError");
const Credentials_1 = require("./Credentials");
const CredentialsExtractor_1 = require("./CredentialsExtractor");
class BearerWebIdExtractor extends CredentialsExtractor_1.CredentialsExtractor {
    constructor() {
        super();
        this.logger = LogUtil_1.getLoggerFor(this);
        this.verify = access_token_verifier_1.createSolidTokenVerifier();
    }
    async canHandle({ headers }) {
        const { authorization } = headers;
        if (!authorization || !authorization.startsWith('Bearer ')) {
            throw new NotImplementedHttpError_1.NotImplementedHttpError('No Bearer Authorization header specified.');
        }
    }
    async handle(request) {
        const { headers: { authorization } } = request;
        try {
            const { webid: webId } = await this.verify(authorization);
            this.logger.info(`Verified WebID via Bearer access token: ${webId}`);
            return { [Credentials_1.CredentialGroup.agent]: { webId } };
        }
        catch (error) {
            const message = `Error verifying WebID via Bearer access token: ${error.message}`;
            this.logger.warn(message);
            throw new BadRequestHttpError_1.BadRequestHttpError(message, { cause: error });
        }
    }
}
exports.BearerWebIdExtractor = BearerWebIdExtractor;
//# sourceMappingURL=BearerWebIdExtractor.js.map