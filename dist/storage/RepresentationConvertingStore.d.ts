import type { Representation } from '../http/representation/Representation';
import type { RepresentationPreferences } from '../http/representation/RepresentationPreferences';
import type { ResourceIdentifier } from '../http/representation/ResourceIdentifier';
import type { Conditions } from './Conditions';
import type { RepresentationConverter } from './conversion/RepresentationConverter';
import { PassthroughStore } from './PassthroughStore';
import type { ModifiedResource, ResourceStore } from './ResourceStore';
/**
 * Store that provides (optional) conversion of incoming and outgoing {@link Representation}s.
 */
export declare class RepresentationConvertingStore<T extends ResourceStore = ResourceStore> extends PassthroughStore<T> {
    protected readonly logger: import("..").Logger;
    private readonly inConverter;
    private readonly outConverter;
    private readonly inPreferences;
    /**
     * TODO: This should take RepresentationPreferences instead of a type string when supported by Components.js.
     */
    constructor(source: T, options: {
        outConverter?: RepresentationConverter;
        inConverter?: RepresentationConverter;
        inType?: string;
    });
    getRepresentation(identifier: ResourceIdentifier, preferences: RepresentationPreferences, conditions?: Conditions): Promise<Representation>;
    addResource(identifier: ResourceIdentifier, representation: Representation, conditions?: Conditions): Promise<ModifiedResource>;
    setRepresentation(identifier: ResourceIdentifier, representation: Representation, conditions?: Conditions): Promise<ModifiedResource[]>;
}
