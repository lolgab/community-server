"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationGatewayHttpHandler = void 0;
const stream_1 = require("stream");
const LogUtil_1 = require("../logging/LogUtil");
const OperationHttpHandler_1 = require("../server/OperationHttpHandler");
const NotImplementedHttpError_1 = require("../util/errors/NotImplementedHttpError");
const GuardedStream_1 = require("../util/GuardedStream");
const PathUtil_1 = require("../util/PathUtil");
const OkResponseDescription_1 = require("./output/response/OkResponseDescription");
const RepresentationMetadata_1 = require("./representation/RepresentationMetadata");
/**
 * Handles the negotiation of notification channels
 */
class NotificationGatewayHttpHandler extends OperationHttpHandler_1.OperationHttpHandler {
    constructor(args) {
        super();
        this.logger = LogUtil_1.getLoggerFor(this);
        // Trimming trailing slashes so the relative URL starts with a slash after slicing this off
        this.subscriptionEndpoint = PathUtil_1.trimTrailingSlashes(PathUtil_1.joinUrl(args.baseUrl, args.subscriptionPath));
        this.subscriptionHandler = args.subscriptionHandler;
        this.supportedTypes = this.subscriptionHandler.getSupportedTypes();
    }
    async canHandle({ operation }) {
        if (operation.method !== 'POST') {
            throw new NotImplementedHttpError_1.NotImplementedHttpError('This handler only supports POST operations');
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async handle({ operation, request }) {
        const body = await request.read();
        const json = JSON.parse(body.toString());
        const requestedTypes = json.type;
        const matches = requestedTypes.filter((type) => this.supportedTypes.includes(type));
        if (matches.length === 0) {
            throw new NotImplementedHttpError_1.NotImplementedHttpError(`This gateway only supports ${this.supportedTypes} notifications`);
        }
        const responseJson = {
            '@context': ['https://www.w3.org/ns/solid/notification/v1'],
            type: matches[0],
            endpoint: this.subscriptionEndpoint,
            features: [],
        };
        const representationMetadata = new RepresentationMetadata_1.RepresentationMetadata('application/ld+json');
        const data = GuardedStream_1.guardStream(stream_1.Readable.from(JSON.stringify(responseJson)));
        return new OkResponseDescription_1.OkResponseDescription(representationMetadata, data);
    }
}
exports.NotificationGatewayHttpHandler = NotificationGatewayHttpHandler;
//# sourceMappingURL=NotificationGatewayHttpHandler.js.map