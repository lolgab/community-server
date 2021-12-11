import type { CredentialsExtractor } from '../authentication/CredentialsExtractor';
import type { OperationHttpHandlerInput } from '../server/OperationHttpHandler';
import { OperationHttpHandler } from '../server/OperationHttpHandler';
import type { KeyValueStorage } from '../storage/keyvalue/KeyValueStorage';
import type { Topic } from './NotificationSubscriptionHttpHandler';
import type { ResponseDescription } from './output/response/ResponseDescription';
export interface WebHookSubscription2021UnsubscribeHttpHandlerArgs {
    baseUrl: string;
    credentialsExtractor: CredentialsExtractor;
    notificationStorage: KeyValueStorage<string, Topic>;
}
export declare class WebHookSubscription2021UnsubscribeHttpHandler extends OperationHttpHandler {
    private readonly baseUrl;
    private readonly credentialsExtractor;
    private readonly notificationStorage;
    constructor(args: WebHookSubscription2021UnsubscribeHttpHandlerArgs);
    handle(input: OperationHttpHandlerInput): Promise<ResponseDescription | undefined>;
}
