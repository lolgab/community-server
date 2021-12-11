/// <reference types="node" />
import { EventEmitter } from 'events';
import type { Patch } from '../http/representation/Patch';
import type { Representation } from '../http/representation/Representation';
import type { RepresentationPreferences } from '../http/representation/RepresentationPreferences';
import type { ResourceIdentifier } from '../http/representation/ResourceIdentifier';
import type { Conditions } from './Conditions';
import type { ModifiedResource, ResourceStore } from './ResourceStore';
/**
 * Store that notifies listeners of changes to its source
 * by emitting a `modified` event.
 */
export declare class MonitoringStore<T extends ResourceStore = ResourceStore> extends EventEmitter implements ResourceStore {
    private readonly source;
    constructor(source: T);
    resourceExists(identifier: ResourceIdentifier, conditions?: Conditions): Promise<boolean>;
    getRepresentation(identifier: ResourceIdentifier, preferences: RepresentationPreferences, conditions?: Conditions): Promise<Representation>;
    addResource(container: ResourceIdentifier, representation: Representation, conditions?: Conditions): Promise<ModifiedResource>;
    deleteResource(identifier: ResourceIdentifier, conditions?: Conditions): Promise<ModifiedResource[]>;
    setRepresentation(identifier: ResourceIdentifier, representation: Representation, conditions?: Conditions): Promise<ModifiedResource[]>;
    modifyResource(identifier: ResourceIdentifier, patch: Patch, conditions?: Conditions): Promise<ModifiedResource[]>;
    private emitChanged;
    private isInternalResource;
}
