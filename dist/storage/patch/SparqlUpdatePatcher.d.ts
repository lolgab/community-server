import type { Representation } from '../../http/representation/Representation';
import { RepresentationPatcher } from './RepresentationPatcher';
import type { RepresentationPatcherInput } from './RepresentationPatcher';
/**
 * Supports application/sparql-update PATCH requests on RDF resources.
 *
 * Only DELETE/INSERT updates without variables are supported.
 */
export declare class SparqlUpdatePatcher extends RepresentationPatcher {
    protected readonly logger: import("../..").Logger;
    private readonly engine;
    constructor();
    canHandle({ patch }: RepresentationPatcherInput): Promise<void>;
    handle(input: RepresentationPatcherInput): Promise<Representation>;
    private isSparqlUpdate;
    private isDeleteInsert;
    private isComposite;
    /**
     * Checks if the input operation is of a supported type (DELETE/INSERT or composite of those)
     */
    private validateUpdate;
    /**
     * Checks if the input DELETE/INSERT is supported.
     * This means: no GRAPH statements, no DELETE WHERE containing terms of type Variable.
     */
    private validateDeleteInsert;
    /**
     * Checks if the composite update only contains supported update components.
     */
    private validateComposite;
    /**
     * Apply the given algebra operation to the given identifier.
     */
    private patch;
}
