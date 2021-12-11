"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebHookSubscription2021UnsubscribeHttpHandler = void 0;
const OkResponseDescription_1 = require("../http/output/response/OkResponseDescription");
const RepresentationMetadata_1 = require("../http/representation/RepresentationMetadata");
const OperationHttpHandler_1 = require("../server/OperationHttpHandler");
const BadRequestHttpError_1 = require("../util/errors/BadRequestHttpError");
class WebHookSubscription2021UnsubscribeHttpHandler extends OperationHttpHandler_1.OperationHttpHandler {
    constructor(args) {
        super();
        this.baseUrl = args.baseUrl;
        this.credentialsExtractor = args.credentialsExtractor;
        this.notificationStorage = args.notificationStorage;
    }
    async handle(input) {
        var _a;
        const { request } = input;
        // Extract WebId Credential
        const credentials = await this.credentialsExtractor.handleSafe(request);
        if (!((_a = credentials.agent) === null || _a === void 0 ? void 0 : _a.webId)) {
            throw new BadRequestHttpError_1.BadRequestHttpError('No WebId present in request');
        }
        const { webId } = credentials.agent;
        // Get the subscription id
        if (!request.url) {
            throw new BadRequestHttpError_1.BadRequestHttpError('No url present in request');
        }
        const splitUrl = request.url.split('/');
        const subscriptionId = splitUrl[splitUrl.length - 1];
        const subscriptionTargetFromId = decodeURIComponent(subscriptionId.split('~~~')[0]);
        // Get the current notification data
        const notificationData = await this.notificationStorage.get(subscriptionTargetFromId);
        if (!((notificationData === null || notificationData === void 0 ? void 0 : notificationData.subscriptions[webId]) &&
            notificationData.subscriptions[webId].id === subscriptionId)) {
            throw new BadRequestHttpError_1.BadRequestHttpError('Subscription does not exist');
        }
        // This rules says that we're using the wrong data structure. I agree, I will bring
        // this up in the next meeting - Jackson
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete notificationData.subscriptions[webId];
        await this.notificationStorage.set(subscriptionTargetFromId, notificationData);
        // Return Response
        const representationMetadata = new RepresentationMetadata_1.RepresentationMetadata('application/ld+json');
        return new OkResponseDescription_1.OkResponseDescription(representationMetadata);
    }
}
exports.WebHookSubscription2021UnsubscribeHttpHandler = WebHookSubscription2021UnsubscribeHttpHandler;
//# sourceMappingURL=WebHookSubscription2021UnsubscribeHttpHandler.js.map