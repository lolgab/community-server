import type { ResponseDescription } from '../http/output/response/ResponseDescription';
import { OperationHttpHandler } from '../server/OperationHttpHandler';
import type { OperationHttpHandlerInput } from '../server/OperationHttpHandler';
import type { OperationHandlerInput } from './ldp/OperationHandler';
import type { NotificationSubscriptionHttpHandler } from './NotificationSubscriptionHttpHandler';
export interface NotificationGatewayHttpHandlerArgs {
    /**
     * Base URL of the gateway.
     */
    baseUrl: string;
    /**
     * Relative path of the IDP entry point.
     */
    subscriptionPath: string;
    /**
      * The notification handler.
      */
    subscriptionHandler: NotificationSubscriptionHttpHandler;
}
/**
 * Handles the negotiation of notification channels
 */
export declare class NotificationGatewayHttpHandler extends OperationHttpHandler {
    protected readonly logger: import("..").Logger;
    private readonly subscriptionHandler;
    private readonly subscriptionEndpoint;
    private readonly supportedTypes;
    constructor(args: NotificationGatewayHttpHandlerArgs);
    canHandle({ operation }: OperationHandlerInput): Promise<void>;
    handle({ operation, request }: OperationHttpHandlerInput): Promise<ResponseDescription | undefined>;
}
