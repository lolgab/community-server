import type { WellKnownBuilder } from '../../../http/well-known/WellKnownBuilder';
interface WebHook2021AuthWellKnownBuilderArgs {
    baseUrl: string;
    jwksEndpointPath: string;
}
export declare class WebHook2021AuthWellKnownBuilder implements WellKnownBuilder {
    private readonly jwksEndpoint;
    constructor(args: WebHook2021AuthWellKnownBuilderArgs);
    getWellKnownSegment(): Promise<Record<string, any>>;
}
export {};
