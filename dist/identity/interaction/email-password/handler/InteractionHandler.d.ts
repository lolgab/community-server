/// <reference types="node" />
import type { KoaContextWithOIDC } from 'oidc-provider';
import type { Operation } from '../../../../http/Operation';
import { AsyncHandler } from '../../../../util/handlers/AsyncHandler';
import type { InteractionCompleterParams } from '../../util/InteractionCompleter';
export declare type Interaction = KoaContextWithOIDC['oidc']['entities']['Interaction'];
export interface InteractionHandlerInput {
    /**
     * The operation to execute
     */
    operation: Operation;
    /**
     * Will be defined if the OIDC library expects us to resolve an interaction it can't handle itself,
     * such as logging a user in.
     */
    oidcInteraction?: Interaction;
}
export declare type InteractionHandlerResult = InteractionResponseResult | InteractionCompleteResult | InteractionErrorResult;
export interface InteractionResponseResult<T = NodeJS.Dict<any>> {
    type: 'response';
    details?: T;
}
export interface InteractionCompleteResult {
    type: 'complete';
    details: InteractionCompleterParams;
}
export interface InteractionErrorResult {
    type: 'error';
    error: Error;
}
/**
 * Handler used for IDP interactions.
 * Only supports JSON data.
 */
export declare abstract class InteractionHandler extends AsyncHandler<InteractionHandlerInput, InteractionHandlerResult> {
    canHandle({ operation }: InteractionHandlerInput): Promise<void>;
}
