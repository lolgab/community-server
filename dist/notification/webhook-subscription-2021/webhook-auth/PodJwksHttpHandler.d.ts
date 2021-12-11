import type { JwksKeyGenerator } from '../../../identity/configuration/JwksKeyGenerator';
import type { HttpHandlerInput } from '../../../server/HttpHandler';
import { HttpHandler } from '../../../server/HttpHandler';
export interface PodJwksHttpHandlerArgs {
    jwksKeyGenerator: JwksKeyGenerator;
}
export declare const POD_JWKS_KEY = "POD_JWKS";
export declare class PodJwksHttpHandler extends HttpHandler {
    private readonly jwksKeyGenerator;
    constructor(args: PodJwksHttpHandlerArgs);
    handle(input: HttpHandlerInput): Promise<void>;
}
