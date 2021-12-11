import type { HttpErrorOptions } from './HttpError';
import { HttpError } from './HttpError';
/**
 * An error thrown when the media type of incoming data is not supported by a parser.
 */
export declare class UnsupportedMediaTypeHttpError extends HttpError {
    constructor(message?: string, options?: HttpErrorOptions);
    static isInstance(error: any): error is UnsupportedMediaTypeHttpError;
}
