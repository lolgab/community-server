import type { ValuePreferences } from '../../http/representation/RepresentationPreferences';
import { RepresentationConverter } from './RepresentationConverter';
import type { RepresentationConverterArgs } from './RepresentationConverter';
declare type PromiseOrValue<T> = T | Promise<T>;
declare type ValuePreferencesArg = PromiseOrValue<string> | PromiseOrValue<string[]> | PromiseOrValue<ValuePreferences>;
/**
 * A {@link RepresentationConverter} that allows requesting the supported types.
 */
export declare abstract class TypedRepresentationConverter extends RepresentationConverter {
    protected inputTypes: Promise<ValuePreferences>;
    protected outputTypes: Promise<ValuePreferences>;
    constructor(inputTypes?: ValuePreferencesArg, outputTypes?: ValuePreferencesArg);
    /**
     * Gets the supported input content types for this converter, mapped to a numerical priority.
     */
    getInputTypes(): Promise<ValuePreferences>;
    /**
     * Gets the supported output content types for this converter, mapped to a numerical quality.
     */
    getOutputTypes(): Promise<ValuePreferences>;
    /**
     * Determines whether the given conversion request is supported,
     * given the available content type conversions:
     *  - Checks if there is a content type for the input.
     *  - Checks if the input type is supported by the parser.
     *  - Checks if the parser can produce one of the preferred output types.
     * Throws an error with details if conversion is not possible.
     */
    canHandle(args: RepresentationConverterArgs): Promise<void>;
}
export {};
