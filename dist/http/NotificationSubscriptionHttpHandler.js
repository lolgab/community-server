"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationSubscriptionHttpHandler = void 0;
const OkResponseDescription_1 = require("../http/output/response/OkResponseDescription");
const RepresentationMetadata_1 = require("../http/representation/RepresentationMetadata");
const LogUtil_1 = require("../logging/LogUtil");
const OperationHttpHandler_1 = require("../server/OperationHttpHandler");
const BadRequestHttpError_1 = require("../util/errors/BadRequestHttpError");
const NotImplementedHttpError_1 = require("../util/errors/NotImplementedHttpError");
/**
 * Handles the negotiation of notification channels
 */
class NotificationSubscriptionHttpHandler extends OperationHttpHandler_1.OperationHttpHandler {
    constructor(args) {
        super();
        this.logger = LogUtil_1.getLoggerFor(this);
        this.subscriptionHandlers = new Map();
        this.credentialsExtractor = args.credentialsExtractor;
        this.permissionReader = args.permissionReader;
        // Trimming trailing slashes so the relative URL starts with a slash after slicing this off
        this.notificationStorage = args.notificationStorage;
        args.handlers.forEach((handler) => {
            this.subscriptionHandlers.set(handler.getType(), handler);
        });
        this.source = args.source;
        this.source.on('changed', async (changed) => this.onResourceChanged(changed));
    }
    getSupportedTypes() {
        return [...this.subscriptionHandlers.keys()];
    }
    async canHandle({ operation }) {
        if (operation.method !== 'POST') {
            throw new NotImplementedHttpError_1.NotImplementedHttpError('This handler only supports POST operations');
        }
    }
    async handle(input) {
        var _a, _b, _c;
        const { request } = input;
        const body = await request.read();
        const subscriptionRequest = JSON.parse(body.toString());
        const subscriptionType = subscriptionRequest.type;
        const subscriptionHandler = this.subscriptionHandlers.get(subscriptionType);
        if (!subscriptionHandler) {
            throw new BadRequestHttpError_1.BadRequestHttpError(`Subscription type ${subscriptionType} not supported`);
        }
        const topicURI = subscriptionRequest.topic;
        const credentials = await this.credentialsExtractor.handleSafe(request);
        if (!((_a = credentials.agent) === null || _a === void 0 ? void 0 : _a.webId)) {
            throw new BadRequestHttpError_1.BadRequestHttpError('No WebId present in request');
        }
        const permissionReaderInput = {
            credentials,
            identifier: { path: topicURI },
        };
        const permissionSet = await this.permissionReader.handleSafe(permissionReaderInput);
        if (!((_b = permissionSet.public) === null || _b === void 0 ? void 0 : _b.read) && !((_c = permissionSet.agent) === null || _c === void 0 ? void 0 : _c.read)) {
            throw new BadRequestHttpError_1.BadRequestHttpError('Agent not allowed to read resource.');
        }
        let topic = await this.notificationStorage.get(topicURI);
        if (!topic) {
            topic = { subscriptions: {} };
        }
        const { subscriptions } = topic;
        const subscription = subscriptionHandler.subscribe(subscriptionRequest);
        subscriptions[credentials.agent.webId] = subscription;
        await this.notificationStorage.set(topicURI, topic);
        this.logger.verbose(`Registered subscription[${subscriptionType}] at topic[${topicURI}] for agent[${credentials.agent.webId}]`);
        const representationMetadata = new RepresentationMetadata_1.RepresentationMetadata('application/ld+json');
        return new OkResponseDescription_1.OkResponseDescription(representationMetadata, subscriptionHandler.getResponseData(subscription));
    }
    async onResourceChanged(resources) {
        const orgResources = [...resources];
        for (const modified of orgResources) {
            // Aconst modified = resources[0];
            let topic = await this.notificationStorage.get(modified.resource.path);
            if (!topic) {
                topic = { subscriptions: {} };
            }
            const { subscriptions } = topic;
            // eslint-disable-next-line guard-for-in
            for (const key in subscriptions) {
                const subscription = subscriptions[key];
                const subscriptionHandler = this.subscriptionHandlers.get(subscription.type);
                await subscriptionHandler.onResourcesChanged(resources, subscription);
            }
            resources.shift();
        }
    }
}
exports.NotificationSubscriptionHttpHandler = NotificationSubscriptionHttpHandler;
//# sourceMappingURL=NotificationSubscriptionHttpHandler.js.map