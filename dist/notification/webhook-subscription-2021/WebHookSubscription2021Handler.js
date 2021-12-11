"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebHookSubscription2021Handler = void 0;
/* eslint-disable no-console */
const stream_1 = require("stream");
const uuid_1 = require("uuid");
const LogUtil_1 = require("../../logging/LogUtil");
const GuardedStream_1 = require("../../util/GuardedStream");
const PathUtil_1 = require("../../util/PathUtil");
const BaseSubscriptionHandler_1 = require("../BaseSubscriptionHandler");
class WebHookSubscription2021Handler extends BaseSubscriptionHandler_1.BaseSubscriptionHandler {
    constructor(args) {
        super();
        this.logger = LogUtil_1.getLoggerFor(this);
        this.httpClient = args.httpClient;
        this.webhookUnsubscribePath = args.webhookUnsubscribePath;
        this.baseUrl = args.baseUrl;
        // To get "this" to work, you need to bind all the methods
        this.subscribe = this.subscribe.bind(this);
        this.getResponseData = this.getResponseData.bind(this);
        this.getType = this.getType.bind(this);
        this.onResourceChanged = this.onResourceChanged.bind(this);
        this.onResourceCreated = this.onResourceCreated.bind(this);
        this.onResourceDeleted = this.onResourceDeleted.bind(this);
        this.onResourcesChanged = this.onResourcesChanged.bind(this);
        this.sendNotification = this.sendNotification.bind(this);
    }
    subscribe(request) {
        const subscription = {
            type: this.getType(),
            target: request.target,
            id: encodeURIComponent(`${request.topic}~~~${uuid_1.v4()}`),
        };
        return subscription;
    }
    getUnsubscribeEndpoint(subscriptionId) {
        return PathUtil_1.trimTrailingSlashes(PathUtil_1.joinUrl(this.baseUrl, this.webhookUnsubscribePath, subscriptionId));
    }
    getResponseData(subscription) {
        const webhookSubscription = subscription;
        if (webhookSubscription.target && webhookSubscription.id) {
            return GuardedStream_1.guardStream(stream_1.Readable.from(JSON.stringify({
                '@context': 'https://www.w3.org/ns/solid/notification/v1',
                type: 'WebHookSubscription2021',
                target: webhookSubscription.target,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                unsubscribe_endpoint: this.getUnsubscribeEndpoint(webhookSubscription.id),
            })));
        }
        return undefined;
    }
    getType() {
        return 'WebHookSubscription2021';
    }
    async onResourceCreated(resource, subscription) {
        this.logger.info(`Resource created ${resource.path}`);
        this.sendNotification('Create', resource, subscription);
    }
    async onResourceChanged(resource, subscription) {
        this.logger.info(`Resource changed ${resource.path}`);
        this.sendNotification('Update', resource, subscription);
    }
    async onResourceDeleted(resource, subscription) {
        this.logger.info(`Resource deleted ${resource.path}`);
        this.sendNotification('Delete', resource, subscription);
    }
    sendNotification(type, resource, subscription) {
        const { target, id } = subscription;
        const payload = {
            '@context': [
                'https://www.w3.org/ns/activitystreams',
                'https://www.w3.org/ns/solid/notification/v1',
            ],
            id: `urn:uuid:${uuid_1.v4()}`,
            type: [type],
            object: {
                id: resource.path,
            },
            published: new Date().toISOString(),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            unsubscribe_endpoint: this.getUnsubscribeEndpoint(id),
        };
        const requestBody = JSON.stringify(payload);
        const reqOptions = {
            method: 'POST',
            headers: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'Content-Type': 'application/json',
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'Content-Length': Buffer.byteLength(requestBody),
            },
        };
        this.httpClient.call(target, reqOptions, requestBody, (res) => {
            console.log(`STATUS: ${res.statusCode}`);
            console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                console.log(`BODY: ${chunk}`);
            });
            res.on('end', () => {
                console.log('No more data in response.');
            });
        });
    }
}
exports.WebHookSubscription2021Handler = WebHookSubscription2021Handler;
//# sourceMappingURL=WebHookSubscription2021Handler.js.map