import type { Representation } from '../../http/representation/Representation';
import { RepresentationConverter } from './RepresentationConverter';
import type { RepresentationConverterArgs } from './RepresentationConverter';
/**
 * A {@link RepresentationConverter} that only converts representations
 * that are not compatible with the preferences.
 */
export declare class IfNeededConverter extends RepresentationConverter {
    private readonly converter;
    protected readonly logger: import("../..").Logger;
    constructor(converter?: RepresentationConverter);
    canHandle(args: RepresentationConverterArgs): Promise<void>;
    handle(args: RepresentationConverterArgs): Promise<Representation>;
    handleSafe(args: RepresentationConverterArgs): Promise<Representation>;
    protected needsConversion({ identifier, representation, preferences }: RepresentationConverterArgs): boolean;
    protected convert(args: RepresentationConverterArgs, safely: boolean): Promise<Representation>;
}
