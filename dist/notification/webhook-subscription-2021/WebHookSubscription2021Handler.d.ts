/// <reference types="node" />
import { Readable } from 'stream';
import type { HttpClient } from '../../http/client/HttpClient';
import type { ResourceIdentifier } from '../../http/representation/ResourceIdentifier';
import type { Guarded } from '../../util/GuardedStream';
import { BaseSubscriptionHandler } from '../BaseSubscriptionHandler';
import type { Subscription } from '../SubscriptionHandler';
export interface WebHookSubscription2021 extends Subscription {
    id: string;
    target: string;
}
export interface WebHookSubscription2021Args {
    /**
     * Writes out the response of the operation.
     */
    httpClient: HttpClient;
    webhookUnsubscribePath: string;
    baseUrl: string;
}
export declare class WebHookSubscription2021Handler extends BaseSubscriptionHandler {
    protected readonly logger: import("../..").Logger;
    private readonly httpClient;
    private readonly webhookUnsubscribePath;
    private readonly baseUrl;
    constructor(args: WebHookSubscription2021Args);
    subscribe(request: any): Subscription;
    private getUnsubscribeEndpoint;
    getResponseData(subscription: Subscription): Guarded<Readable> | undefined;
    getType(): string;
    onResourceCreated(resource: ResourceIdentifier, subscription: Subscription): Promise<void>;
    onResourceChanged(resource: ResourceIdentifier, subscription: Subscription): Promise<void>;
    onResourceDeleted(resource: ResourceIdentifier, subscription: Subscription): Promise<void>;
    private sendNotification;
}
