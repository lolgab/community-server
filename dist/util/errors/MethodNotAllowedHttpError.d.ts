import type { HttpErrorOptions } from './HttpError';
import { HttpError } from './HttpError';
/**
 * An error thrown when data was found for the requested identifier, but is not supported by the target resource.
 */
export declare class MethodNotAllowedHttpError extends HttpError {
    constructor(message?: string, options?: HttpErrorOptions);
    static isInstance(error: any): error is MethodNotAllowedHttpError;
}
