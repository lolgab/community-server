import type { ErrorHandler } from '../http/output/error/ErrorHandler';
import { ResponseDescription } from '../http/output/response/ResponseDescription';
import type { OperationHttpHandlerInput } from '../server/OperationHttpHandler';
import { OperationHttpHandler } from '../server/OperationHttpHandler';
import type { RepresentationConverter } from '../storage/conversion/RepresentationConverter';
import type { ProviderFactory } from './configuration/ProviderFactory';
import type { InteractionRoute } from './interaction/routing/InteractionRoute';
import type { InteractionCompleter } from './interaction/util/InteractionCompleter';
export interface IdentityProviderHttpHandlerArgs {
    /**
     * Base URL of the server.
     */
    baseUrl: string;
    /**
     * Relative path of the IDP entry point.
     */
    idpPath: string;
    /**
     * Used to generate the OIDC provider.
     */
    providerFactory: ProviderFactory;
    /**
     * All routes handling the custom IDP behaviour.
     */
    interactionRoutes: InteractionRoute[];
    /**
     * Used for content negotiation.
     */
    converter: RepresentationConverter;
    /**
     * Used for POST requests that need to be handled by the OIDC library.
     */
    interactionCompleter: InteractionCompleter;
    /**
     * Used for converting output errors.
     */
    errorHandler: ErrorHandler;
}
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
export declare class IdentityProviderHttpHandler extends OperationHttpHandler {
    protected readonly logger: import("..").Logger;
    private readonly baseUrl;
    private readonly providerFactory;
    private readonly interactionRoutes;
    private readonly converter;
    private readonly interactionCompleter;
    private readonly errorHandler;
    private readonly controls;
    constructor(args: IdentityProviderHttpHandlerArgs);
    /**
     * Finds the matching route and resolves the operation.
     */
    handle({ operation, request, response }: OperationHttpHandlerInput): Promise<ResponseDescription | undefined>;
    /**
     * Finds a route that supports the given request.
     */
    private findRoute;
    /**
     * Creates a ResponseDescription based on the InteractionHandlerResult.
     * This will either be a redirect if type is "complete" or a data stream if the type is "response".
     */
    private handleInteractionResult;
    /**
     * Converts an InteractionResponseResult to a ResponseDescription by first converting to a Representation
     * and applying necessary conversions.
     */
    private handleResponseResult;
    /**
     * Converts the controls object of a route to one with full URLs.
     */
    private getRouteControls;
}
