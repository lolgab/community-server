import type { WellKnownBuilder } from './WellKnownBuilder';
export declare class AggregateWellKnownBuilder implements WellKnownBuilder {
    private readonly wellKnownBuilders;
    constructor(wellKnownBuilders: WellKnownBuilder[]);
    getWellKnownSegment(): Promise<Record<string, any>>;
}
