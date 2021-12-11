import type { HttpErrorOptions } from './HttpError';
import { HttpError } from './HttpError';
/**
 * An error thrown when access was denied due to the conditions on the request.
 */
export declare class PreconditionFailedHttpError extends HttpError {
    constructor(message?: string, options?: HttpErrorOptions);
    static isInstance(error: any): error is PreconditionFailedHttpError;
}
