/// <reference types="node" />
import type { RequestOptions, IncomingMessage } from 'http';
import type { URL } from 'url';
import type { HttpClient } from './HttpClient';
export declare class BaseHttpClient implements HttpClient {
    call(target: string | URL, options: RequestOptions, data: any, callback?: ((res: IncomingMessage) => void) | undefined): void;
}
