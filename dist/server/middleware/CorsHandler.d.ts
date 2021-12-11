import type { HttpHandlerInput } from '../HttpHandler';
import { HttpHandler } from '../HttpHandler';
interface SimpleCorsOptions {
    origin?: string;
    methods?: string[];
    allowedHeaders?: string[];
    exposedHeaders?: string[];
    credentials?: boolean;
    maxAge?: number;
    preflightContinue?: boolean;
    optionsSuccessStatus?: number;
}
/**
 * Handler that sets CORS options on the response.
 * In case of an OPTIONS request this handler will close the connection after adding its headers.
 *
 * Solid, §7.1: "A data pod MUST implement the CORS protocol [FETCH] such that, to the extent possible,
 * the browser allows Solid apps to send any request and combination of request headers to the data pod,
 * and the Solid app can read any response and response headers received from the data pod."
 * Full details: https://solid.github.io/specification/protocol#cors-server
 */
export declare class CorsHandler extends HttpHandler {
    private readonly corsHandler;
    constructor(options?: SimpleCorsOptions);
    handle(input: HttpHandlerInput): Promise<void>;
}
export {};
