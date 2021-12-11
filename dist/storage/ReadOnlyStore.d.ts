import type { Patch } from '../http/representation/Patch';
import type { Representation } from '../http/representation/Representation';
import type { ResourceIdentifier } from '../http/representation/ResourceIdentifier';
import type { Conditions } from './Conditions';
import { PassthroughStore } from './PassthroughStore';
import type { ModifiedResource, ResourceStore } from './ResourceStore';
/**
 * Store that only allow read operations on the underlying source.
 */
export declare class ReadOnlyStore<T extends ResourceStore = ResourceStore> extends PassthroughStore<T> {
    constructor(source: T);
    addResource(container: ResourceIdentifier, representation: Representation, conditions?: Conditions): Promise<ModifiedResource>;
    deleteResource(identifier: ResourceIdentifier, conditions?: Conditions): Promise<ModifiedResource[]>;
    modifyResource(identifier: ResourceIdentifier, patch: Patch, conditions?: Conditions): Promise<ModifiedResource[]>;
    setRepresentation(identifier: ResourceIdentifier, representation: Representation, conditions?: Conditions): Promise<ModifiedResource[]>;
}
