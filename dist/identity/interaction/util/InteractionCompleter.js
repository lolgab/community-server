"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionCompleter = void 0;
const http_1 = require("http");
const AsyncHandler_1 = require("../../../util/handlers/AsyncHandler");
/**
 * Completes an IDP interaction, logging the user in.
 * Returns the URL the request should be redirected to.
 */
class InteractionCompleter extends AsyncHandler_1.AsyncHandler {
    constructor(providerFactory) {
        super();
        this.providerFactory = providerFactory;
    }
    async handle(input) {
        const provider = await this.providerFactory.getProvider();
        const result = {
            login: {
                account: input.webId,
                remember: input.shouldRemember,
                ts: Math.floor(Date.now() / 1000),
            },
            consent: {
                rejectedScopes: input.shouldRemember ? [] : ['offline_access'],
            },
        };
        // Response object is not actually needed here so we can just mock it like this
        // to bypass the OIDC library checks.
        // See https://github.com/panva/node-oidc-provider/discussions/1078
        return provider.interactionResult(input.request, Object.create(http_1.ServerResponse.prototype), result);
    }
}
exports.InteractionCompleter = InteractionCompleter;
//# sourceMappingURL=InteractionCompleter.js.map