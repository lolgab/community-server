/// <reference types="node" />
import type { IncomingMessage } from 'http';
import type { Guarded } from '../../util/GuardedStream';
/**
 * An incoming HTTP request;
 */
export declare type HttpResponse = Guarded<IncomingMessage>;
/**
 * Checks if the given stream is an HttpResponse.
 */
export declare function isHttpResponse(stream: any): stream is HttpResponse;
