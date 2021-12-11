import type { HttpErrorOptions } from './HttpError';
import { HttpError } from './HttpError';
/**
 * A generic error message, given when an unexpected condition was encountered and no more specific message is suitable.
 */
export declare class InternalServerError extends HttpError {
    constructor(message?: string, options?: HttpErrorOptions);
    static isInstance(error: any): error is InternalServerError;
}
