import type { HttpErrorOptions } from './HttpError';
import { HttpError } from './HttpError';
/**
 * An error thrown when an agent is not allowed to access data.
 */
export declare class ForbiddenHttpError extends HttpError {
    constructor(message?: string, options?: HttpErrorOptions);
    static isInstance(error: any): error is ForbiddenHttpError;
}
