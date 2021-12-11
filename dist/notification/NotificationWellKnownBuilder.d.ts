import type { WellKnownBuilder } from '../http/well-known/WellKnownBuilder';
export interface NotificationWellKnownBuilderArgs {
    baseUrl: string;
    notificationEndpointPath: string;
}
export declare class NotificationWellKnownBuilder implements WellKnownBuilder {
    private readonly notificationEndpoint;
    constructor(args: NotificationWellKnownBuilderArgs);
    getWellKnownSegment(): Promise<Record<string, any>>;
}
