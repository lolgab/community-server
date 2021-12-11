import type { HttpErrorOptions } from './HttpError';
import { HttpError } from './HttpError';
/**
 * An error thrown when incoming data is not supported.
 * Probably because an {@link AsyncHandler} returns false on the canHandle call.
 */
export declare class BadRequestHttpError extends HttpError {
    /**
     * Default message is 'The given input is not supported by the server configuration.'.
     * @param message - Optional, more specific, message.
     * @param options - Optional error options.
     */
    constructor(message?: string, options?: HttpErrorOptions);
    static isInstance(error: any): error is BadRequestHttpError;
}
