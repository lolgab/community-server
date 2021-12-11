/// <reference types="node" />
import type { Readable } from 'stream';
import type { ModifiedResource } from '..';
import type { ResourceIdentifier } from '../http/representation/ResourceIdentifier';
import type { Guarded } from '../util/GuardedStream';
import type { Subscription, SubscriptionHandler } from './SubscriptionHandler';
export declare abstract class BaseSubscriptionHandler implements SubscriptionHandler {
    abstract getResponseData(subscription: Subscription): Guarded<Readable> | undefined;
    abstract getType(): string;
    abstract subscribe(request: any): Subscription;
    abstract onResourceCreated(resource: ResourceIdentifier, subscription: Subscription): void;
    abstract onResourceChanged(resource: ResourceIdentifier, subscription: Subscription): void;
    abstract onResourceDeleted(resource: ResourceIdentifier, subscription: Subscription): void;
    onResourcesChanged(resources: ModifiedResource[], subscription: Subscription): Promise<void>;
    private onHandler;
}
