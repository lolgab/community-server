import { HttpHandler } from '../../server/HttpHandler';
import type { HttpHandlerInput } from '../../server/HttpHandler';
import type { WellKnownBuilder } from './WellKnownBuilder';
export declare class WellKnownHandler extends HttpHandler {
    private readonly wellKnownBuilder;
    constructor(wellKnownBuilder: WellKnownBuilder);
    handle(input: HttpHandlerInput): Promise<void>;
}
