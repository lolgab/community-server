import type { RequestParser } from '../http/input/RequestParser';
import type { OperationMetadataCollector } from '../http/ldp/metadata/OperationMetadataCollector';
import type { ErrorHandler } from '../http/output/error/ErrorHandler';
import type { ResponseWriter } from '../http/output/ResponseWriter';
import type { HttpHandlerInput } from './HttpHandler';
import { HttpHandler } from './HttpHandler';
import type { OperationHttpHandler } from './OperationHttpHandler';
export interface ParsingHttpHandlerArgs {
    /**
     * Parses the incoming requests.
     */
    requestParser: RequestParser;
    /**
     * Generates generic operation metadata that is required for a response.
     */
    metadataCollector: OperationMetadataCollector;
    /**
     * Converts errors to a serializable format.
     */
    errorHandler: ErrorHandler;
    /**
     * Writes out the response of the operation.
     */
    responseWriter: ResponseWriter;
    /**
     * Handler to send the operation to.
     */
    operationHandler: OperationHttpHandler;
}
/**
 * Parses requests and sends the resulting Operation to wrapped operationHandler.
 * Errors are caught and handled by the Errorhandler.
 * In case the operationHandler returns a result it will be sent to the ResponseWriter.
 */
export declare class ParsingHttpHandler extends HttpHandler {
    private readonly logger;
    private readonly requestParser;
    private readonly errorHandler;
    private readonly responseWriter;
    private readonly metadataCollector;
    private readonly operationHandler;
    constructor(args: ParsingHttpHandlerArgs);
    handle({ request, response }: HttpHandlerInput): Promise<void>;
}
