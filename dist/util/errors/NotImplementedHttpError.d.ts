import type { HttpErrorOptions } from './HttpError';
import { HttpError } from './HttpError';
/**
 * The server either does not recognize the request method, or it lacks the ability to fulfil the request.
 * Usually this implies future availability (e.g., a new feature of a web-service API).
 */
export declare class NotImplementedHttpError extends HttpError {
    constructor(message?: string, options?: HttpErrorOptions);
    static isInstance(error: any): error is NotImplementedHttpError;
}
