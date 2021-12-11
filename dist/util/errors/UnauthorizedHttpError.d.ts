import type { HttpErrorOptions } from './HttpError';
import { HttpError } from './HttpError';
/**
 * An error thrown when an agent is not authorized.
 */
export declare class UnauthorizedHttpError extends HttpError {
    constructor(message?: string, options?: HttpErrorOptions);
    static isInstance(error: any): error is UnauthorizedHttpError;
}
