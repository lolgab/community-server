/// <reference types="node" />
import type { RequestOptions, IncomingMessage } from 'http';
import type { URL } from 'url';
import type { HttpClient } from '../../../http/client/HttpClient';
import type { JwksKeyGenerator } from '../../../identity/configuration/JwksKeyGenerator';
export interface WebHookAuthHttpClientArgs {
    jwksKeyGenerator: JwksKeyGenerator;
    baseUrl: string;
}
export declare class WebHookAuthHttpClient implements HttpClient {
    private readonly jwksKeyGenerator;
    private readonly baseUrl;
    constructor(args: WebHookAuthHttpClientArgs);
    call(url: string | URL, options: RequestOptions, data: any, callback?: ((res: IncomingMessage) => void) | undefined): void;
}
