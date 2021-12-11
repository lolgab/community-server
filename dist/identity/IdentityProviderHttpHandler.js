"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityProviderHttpHandler = void 0;
const RedirectResponseDescription_1 = require("../http/output/response/RedirectResponseDescription");
const ResponseDescription_1 = require("../http/output/response/ResponseDescription");
const BasicRepresentation_1 = require("../http/representation/BasicRepresentation");
const LogUtil_1 = require("../logging/LogUtil");
const OperationHttpHandler_1 = require("../server/OperationHttpHandler");
const ContentTypes_1 = require("../util/ContentTypes");
const BadRequestHttpError_1 = require("../util/errors/BadRequestHttpError");
const PathUtil_1 = require("../util/PathUtil");
const ResourceUtil_1 = require("../util/ResourceUtil");
const StreamUtil_1 = require("../util/StreamUtil");
// Registration is not standardized within Solid yet, so we use a custom versioned API for now
const API_VERSION = '0.2';
/**
 * Handles all requests relevant for the entire IDP interaction,
 * by sending them to either a matching {@link InteractionRoute},
 * or the generated Provider from the {@link ProviderFactory} if there is no match.
 *
 * The InteractionRoutes handle all requests where we need custom behaviour,
 * such as everything related to generating and validating an account.
 * The Provider handles all the default request such as the initial handshake.
 *
 * This handler handles all requests since it assumes all those requests are relevant for the IDP interaction.
 * A {@link RouterHandler} should be used to filter out other requests.
 */
class IdentityProviderHttpHandler extends OperationHttpHandler_1.OperationHttpHandler {
    constructor(args) {
        // It is important that the RequestParser does not read out the Request body stream.
        // Otherwise we can't pass it anymore to the OIDC library when needed.
        super();
        this.logger = LogUtil_1.getLoggerFor(this);
        // Trimming trailing slashes so the relative URL starts with a slash after slicing this off
        this.baseUrl = PathUtil_1.trimTrailingSlashes(PathUtil_1.joinUrl(args.baseUrl, args.idpPath));
        this.providerFactory = args.providerFactory;
        this.interactionRoutes = args.interactionRoutes;
        this.converter = args.converter;
        this.interactionCompleter = args.interactionCompleter;
        this.errorHandler = args.errorHandler;
        this.controls = Object.assign({}, ...this.interactionRoutes.map((route) => this.getRouteControls(route)));
    }
    /**
     * Finds the matching route and resolves the operation.
     */
    async handle({ operation, request, response }) {
        // This being defined means we're in an OIDC session
        let oidcInteraction;
        try {
            const provider = await this.providerFactory.getProvider();
            // This being defined means we're in an OIDC session
            oidcInteraction = await provider.interactionDetails(request, response);
        }
        catch {
            // Just a regular request
        }
        // If our own interaction handler does not support the input, it is either invalid or a request for the OIDC library
        const route = await this.findRoute(operation, oidcInteraction);
        if (!route) {
            const provider = await this.providerFactory.getProvider();
            this.logger.debug(`Sending request to oidc-provider: ${request.url}`);
            // Even though the typings do not indicate this, this is a Promise that needs to be awaited.
            // Otherwise the `BaseHttpServerFactory` will write a 404 before the OIDC library could handle the response.
            // eslint-disable-next-line @typescript-eslint/await-thenable
            await provider.callback(request, response);
            return;
        }
        // Cloning input data so it can be sent back in case of errors
        let clone = operation.body;
        // IDP handlers expect JSON data
        if (!operation.body.isEmpty) {
            const args = {
                representation: operation.body,
                preferences: { type: { [ContentTypes_1.APPLICATION_JSON]: 1 } },
                identifier: operation.target,
            };
            operation.body = await this.converter.handleSafe(args);
            clone = await ResourceUtil_1.cloneRepresentation(operation.body);
        }
        const result = await route.handleOperation(operation, oidcInteraction);
        // Reset the body so it can be reused when needed for output
        operation.body = clone;
        return this.handleInteractionResult(operation, request, result, oidcInteraction);
    }
    /**
     * Finds a route that supports the given request.
     */
    async findRoute(operation, oidcInteraction) {
        if (!operation.target.path.startsWith(this.baseUrl)) {
            // This is either an invalid request or a call to the .well-known configuration
            return;
        }
        const pathName = operation.target.path.slice(this.baseUrl.length);
        for (const route of this.interactionRoutes) {
            if (route.supportsPath(pathName, oidcInteraction === null || oidcInteraction === void 0 ? void 0 : oidcInteraction.prompt.name)) {
                return route;
            }
        }
    }
    /**
     * Creates a ResponseDescription based on the InteractionHandlerResult.
     * This will either be a redirect if type is "complete" or a data stream if the type is "response".
     */
    async handleInteractionResult(operation, request, result, oidcInteraction) {
        var _a;
        let responseDescription;
        if (result.type === 'complete') {
            if (!oidcInteraction) {
                throw new BadRequestHttpError_1.BadRequestHttpError('This action can only be performed as part of an OIDC authentication flow.', { errorCode: 'E0002' });
            }
            // Create a redirect URL with the OIDC library
            const location = await this.interactionCompleter.handleSafe({ ...result.details, request });
            responseDescription = new RedirectResponseDescription_1.RedirectResponseDescription(location);
        }
        else if (result.type === 'error') {
            // We want to show the errors on the original page in case of html interactions, so we can't just throw them here
            const preferences = { type: { [ContentTypes_1.APPLICATION_JSON]: 1 } };
            const response = await this.errorHandler.handleSafe({ error: result.error, preferences });
            const details = await StreamUtil_1.readJsonStream(response.data);
            // Add the input data to the JSON response;
            if (!operation.body.isEmpty) {
                details.prefilled = await StreamUtil_1.readJsonStream(operation.body.data);
                // Don't send passwords back
                delete details.prefilled.password;
                delete details.prefilled.confirmPassword;
            }
            responseDescription =
                await this.handleResponseResult(details, operation, result.templateFiles, oidcInteraction, response.statusCode);
        }
        else {
            // Convert the response object to a data stream
            responseDescription =
                await this.handleResponseResult((_a = result.details) !== null && _a !== void 0 ? _a : {}, operation, result.templateFiles, oidcInteraction);
        }
        return responseDescription;
    }
    /**
     * Converts an InteractionResponseResult to a ResponseDescription by first converting to a Representation
     * and applying necessary conversions.
     */
    async handleResponseResult(details, operation, templateFiles, oidcInteraction, statusCode = 200) {
        const json = {
            ...details,
            apiVersion: API_VERSION,
            authenticating: Boolean(oidcInteraction),
            controls: this.controls,
        };
        const representation = new BasicRepresentation_1.BasicRepresentation(JSON.stringify(json), operation.target, ContentTypes_1.APPLICATION_JSON);
        // Template metadata is required for conversion
        for (const [type, templateFile] of Object.entries(templateFiles)) {
            ResourceUtil_1.addTemplateMetadata(representation.metadata, templateFile, type);
        }
        // Potentially convert the Representation based on the preferences
        const args = { representation, preferences: operation.preferences, identifier: operation.target };
        const converted = await this.converter.handleSafe(args);
        return new ResponseDescription_1.ResponseDescription(statusCode, converted.metadata, converted.data);
    }
    /**
     * Converts the controls object of a route to one with full URLs.
     */
    getRouteControls(route) {
        const entries = Object.entries(route.getControls())
            .map(([name, path]) => [name, PathUtil_1.joinUrl(this.baseUrl, path)]);
        return Object.fromEntries(entries);
    }
}
exports.IdentityProviderHttpHandler = IdentityProviderHttpHandler;
//# sourceMappingURL=IdentityProviderHttpHandler.js.map