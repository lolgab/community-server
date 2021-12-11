"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetupHttpHandler = void 0;
const ResponseDescription_1 = require("../../http/output/response/ResponseDescription");
const BasicRepresentation_1 = require("../../http/representation/BasicRepresentation");
const LogUtil_1 = require("../../logging/LogUtil");
const OperationHttpHandler_1 = require("../../server/OperationHttpHandler");
const ContentTypes_1 = require("../../util/ContentTypes");
const ErrorUtil_1 = require("../../util/errors/ErrorUtil");
const HttpError_1 = require("../../util/errors/HttpError");
const InternalServerError_1 = require("../../util/errors/InternalServerError");
const MethodNotAllowedHttpError_1 = require("../../util/errors/MethodNotAllowedHttpError");
const NotImplementedHttpError_1 = require("../../util/errors/NotImplementedHttpError");
const ResourceUtil_1 = require("../../util/ResourceUtil");
const StreamUtil_1 = require("../../util/StreamUtil");
/**
 * Handles the initial setup of a server.
 * Will capture all requests until setup is finished,
 * this to prevent accidentally running unsafe servers.
 *
 * GET requests will return the view template which should contain the setup information for the user.
 * POST requests will run an initializer and/or perform a registration step, both optional.
 * After successfully completing a POST request this handler will disable itself and become unreachable.
 * All other methods will be rejected.
 */
class SetupHttpHandler extends OperationHttpHandler_1.OperationHttpHandler {
    constructor(args) {
        super();
        this.logger = LogUtil_1.getLoggerFor(this);
        this.finished = false;
        this.registrationManager = args.registrationManager;
        this.initializer = args.initializer;
        this.converter = args.converter;
        this.storageKey = args.storageKey;
        this.storage = args.storage;
        this.viewTemplate = args.viewTemplate;
        this.responseTemplate = args.responseTemplate;
        this.errorHandler = args.errorHandler;
    }
    async handle({ operation }) {
        let json;
        let template;
        let success = false;
        let statusCode = 200;
        try {
            ({ json, template } = await this.getJsonResult(operation));
            success = true;
        }
        catch (err) {
            // We want to show the errors on the original page in case of HTML interactions, so we can't just throw them here
            const error = HttpError_1.HttpError.isInstance(err) ? err : new InternalServerError_1.InternalServerError(ErrorUtil_1.createErrorMessage(err));
            ({ statusCode } = error);
            this.logger.warn(error.message);
            const response = await this.errorHandler.handleSafe({ error, preferences: { type: { [ContentTypes_1.APPLICATION_JSON]: 1 } } });
            json = await StreamUtil_1.readJsonStream(response.data);
            template = this.viewTemplate;
        }
        // Convert the response JSON to the required format
        const representation = new BasicRepresentation_1.BasicRepresentation(JSON.stringify(json), operation.target, ContentTypes_1.APPLICATION_JSON);
        ResourceUtil_1.addTemplateMetadata(representation.metadata, template, ContentTypes_1.TEXT_HTML);
        const result = await this.converter.handleSafe({ representation, identifier: operation.target, preferences: operation.preferences });
        // Make sure this setup handler is never used again after a successful POST request
        if (success && operation.method === 'POST') {
            this.finished = true;
            await this.storage.set(this.storageKey, true);
        }
        return new ResponseDescription_1.ResponseDescription(statusCode, result.metadata, result.data);
    }
    /**
     * Creates a JSON object representing the result of executing the given operation,
     * together with the template it should be applied to.
     */
    async getJsonResult(operation) {
        if (operation.method === 'GET') {
            // Return the initial setup page
            return { json: {}, template: this.viewTemplate };
        }
        if (operation.method !== 'POST') {
            throw new MethodNotAllowedHttpError_1.MethodNotAllowedHttpError();
        }
        // Registration manager expects JSON data
        let json = {};
        if (!operation.body.isEmpty) {
            const args = {
                representation: operation.body,
                preferences: { type: { [ContentTypes_1.APPLICATION_JSON]: 1 } },
                identifier: operation.target,
            };
            const converted = await this.converter.handleSafe(args);
            json = await StreamUtil_1.readJsonStream(converted.data);
            this.logger.debug(`Input JSON: ${JSON.stringify(json)}`);
        }
        // We want to initialize after the input has been validated, but before (potentially) writing a pod
        // since that might overwrite the initializer result
        if (json.initialize && !json.registration) {
            if (!this.initializer) {
                throw new NotImplementedHttpError_1.NotImplementedHttpError('This server is not configured with a setup initializer.');
            }
            await this.initializer.handleSafe();
        }
        let output = {};
        // We only call the RegistrationManager when getting registration input.
        // This way it is also possible to set up a server without requiring registration parameters.
        let validated;
        if (json.registration) {
            if (!this.registrationManager) {
                throw new NotImplementedHttpError_1.NotImplementedHttpError('This server is not configured to support registration during setup.');
            }
            // Validate the input JSON
            validated = this.registrationManager.validateInput(json, true);
            this.logger.debug(`Validated input: ${JSON.stringify(validated)}`);
            // Register and/or create a pod as requested. Potentially does nothing if all booleans are false.
            output = await this.registrationManager.register(validated, true);
        }
        // Add extra setup metadata
        output.initialize = Boolean(json.initialize);
        output.registration = Boolean(json.registration);
        this.logger.debug(`Output: ${JSON.stringify(output)}`);
        return { json: output, template: this.responseTemplate };
    }
}
exports.SetupHttpHandler = SetupHttpHandler;
//# sourceMappingURL=SetupHttpHandler.js.map