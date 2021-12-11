import type { HttpRequest } from '../../../server/HttpRequest';
import { AsyncHandler } from '../../../util/handlers/AsyncHandler';
import type { ProviderFactory } from '../../configuration/ProviderFactory';
/**
 * Parameters required to specify how the interaction should be completed.
 */
export interface InteractionCompleterParams {
    webId: string;
    shouldRemember?: boolean;
}
export interface InteractionCompleterInput extends InteractionCompleterParams {
    request: HttpRequest;
}
/**
 * Completes an IDP interaction, logging the user in.
 * Returns the URL the request should be redirected to.
 */
export declare class InteractionCompleter extends AsyncHandler<InteractionCompleterInput, string> {
    private readonly providerFactory;
    constructor(providerFactory: ProviderFactory);
    handle(input: InteractionCompleterInput): Promise<string>;
}
