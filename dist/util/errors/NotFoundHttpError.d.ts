import type { HttpErrorOptions } from './HttpError';
import { HttpError } from './HttpError';
/**
 * An error thrown when no data was found for the requested identifier.
 */
export declare class NotFoundHttpError extends HttpError {
    constructor(message?: string, options?: HttpErrorOptions);
    static isInstance(error: any): error is NotFoundHttpError;
}
