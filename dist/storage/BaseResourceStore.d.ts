import type { Patch } from '../http/representation/Patch';
import type { Representation } from '../http/representation/Representation';
import type { RepresentationPreferences } from '../http/representation/RepresentationPreferences';
import type { ResourceIdentifier } from '../http/representation/ResourceIdentifier';
import type { Conditions } from './Conditions';
import type { ModifiedResource, ResourceStore } from './ResourceStore';
/**
 * Base implementation of ResourceStore for implementers of custom stores.
 */
export declare class BaseResourceStore implements ResourceStore {
    resourceExists(identifier: ResourceIdentifier, conditions?: Conditions): Promise<boolean>;
    getRepresentation(identifier: ResourceIdentifier, preferences: RepresentationPreferences, conditions?: Conditions): Promise<Representation>;
    setRepresentation(identifier: ResourceIdentifier, representation: Representation, conditions?: Conditions): Promise<ModifiedResource[]>;
    addResource(container: ResourceIdentifier, representation: Representation, conditions?: Conditions): Promise<ModifiedResource>;
    deleteResource(identifier: ResourceIdentifier, conditions?: Conditions): Promise<ModifiedResource[]>;
    modifyResource(identifier: ResourceIdentifier, patch: Patch, conditions?: Conditions): Promise<ModifiedResource[]>;
}
