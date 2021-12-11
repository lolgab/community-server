/// <reference types="node" />
import type { EventEmitter } from 'events';
import type { CredentialsExtractor } from '../authentication/CredentialsExtractor';
import type { PermissionReader } from '../authorization/PermissionReader';
import type { OperationHandlerInput } from '../http/ldp/OperationHandler';
import type { ResponseDescription } from '../http/output/response/ResponseDescription';
import type { Subscription, SubscriptionHandler } from '../notification/SubscriptionHandler';
import { OperationHttpHandler } from '../server/OperationHttpHandler';
import type { OperationHttpHandlerInput } from '../server/OperationHttpHandler';
import type { KeyValueStorage } from '../storage/keyvalue/KeyValueStorage';
export interface NotificationSubscriptionHttpHandlerArgs {
    /**
     * Base URL of the gateway.
     */
    baseUrl: string;
    /**
     * Relative path of the IDP entry point.
     */
    wsEndpoint: string;
    /**
     * Extracts the credentials from the incoming request.
     */
    credentialsExtractor: CredentialsExtractor;
    /**
     * Reads the permissions available for the Operation.
     */
    permissionReader: PermissionReader;
    /**
     * The storage where notification metadata will be stored.
     */
    notificationStorage: KeyValueStorage<string, Topic>;
    /**
     * The configured subscription handlers
     */
    handlers: SubscriptionHandler[];
    /**
     * The resource store to monitor for changes
     */
    source: EventEmitter;
}
export interface Topic {
    subscriptions: Record<string, Subscription>;
}
/**
 * Handles the negotiation of notification channels
 */
export declare class NotificationSubscriptionHttpHandler extends OperationHttpHandler {
    protected readonly logger: import("..").Logger;
    private readonly credentialsExtractor;
    private readonly permissionReader;
    private readonly notificationStorage;
    private readonly subscriptionHandlers;
    private readonly source;
    constructor(args: NotificationSubscriptionHttpHandlerArgs);
    getSupportedTypes(): string[];
    canHandle({ operation }: OperationHandlerInput): Promise<void>;
    handle(input: OperationHttpHandlerInput): Promise<ResponseDescription | undefined>;
    private onResourceChanged;
}
