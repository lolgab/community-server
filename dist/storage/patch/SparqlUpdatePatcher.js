"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SparqlUpdatePatcher = void 0;
const actor_init_sparql_1 = require("@comunica/actor-init-sparql");
const data_model_1 = require("@rdfjs/data-model");
const n3_1 = require("n3");
const sparqlalgebrajs_1 = require("sparqlalgebrajs");
const BasicRepresentation_1 = require("../../http/representation/BasicRepresentation");
const RepresentationMetadata_1 = require("../../http/representation/RepresentationMetadata");
const LogUtil_1 = require("../../logging/LogUtil");
const ContentTypes_1 = require("../../util/ContentTypes");
const InternalServerError_1 = require("../../util/errors/InternalServerError");
const NotImplementedHttpError_1 = require("../../util/errors/NotImplementedHttpError");
const StreamUtil_1 = require("../../util/StreamUtil");
const RepresentationPatcher_1 = require("./RepresentationPatcher");
/**
 * Supports application/sparql-update PATCH requests on RDF resources.
 *
 * Only DELETE/INSERT updates without variables are supported.
 */
class SparqlUpdatePatcher extends RepresentationPatcher_1.RepresentationPatcher {
    constructor() {
        super();
        this.logger = LogUtil_1.getLoggerFor(this);
        this.engine = actor_init_sparql_1.newEngine();
    }
    async canHandle({ patch }) {
        if (!this.isSparqlUpdate(patch)) {
            throw new NotImplementedHttpError_1.NotImplementedHttpError('Only SPARQL update patches are supported');
        }
    }
    async handle(input) {
        // Verify the patch
        const { patch, representation, identifier } = input;
        const op = patch.algebra;
        // In case of a NOP we can skip everything
        if (op.type === sparqlalgebrajs_1.Algebra.types.NOP) {
            return representation !== null && representation !== void 0 ? representation : new BasicRepresentation_1.BasicRepresentation([], identifier, ContentTypes_1.INTERNAL_QUADS, false);
        }
        this.validateUpdate(op);
        return this.patch(input);
    }
    isSparqlUpdate(patch) {
        return typeof patch.algebra === 'object';
    }
    isDeleteInsert(op) {
        return op.type === sparqlalgebrajs_1.Algebra.types.DELETE_INSERT;
    }
    isComposite(op) {
        return op.type === sparqlalgebrajs_1.Algebra.types.COMPOSITE_UPDATE;
    }
    /**
     * Checks if the input operation is of a supported type (DELETE/INSERT or composite of those)
     */
    validateUpdate(op) {
        if (this.isDeleteInsert(op)) {
            this.validateDeleteInsert(op);
        }
        else if (this.isComposite(op)) {
            this.validateComposite(op);
        }
        else {
            this.logger.warn(`Unsupported operation: ${op.type}`);
            throw new NotImplementedHttpError_1.NotImplementedHttpError('Only DELETE/INSERT SPARQL update operations are supported');
        }
    }
    /**
     * Checks if the input DELETE/INSERT is supported.
     * This means: no GRAPH statements, no DELETE WHERE containing terms of type Variable.
     */
    validateDeleteInsert(op) {
        var _a, _b;
        const def = data_model_1.defaultGraph();
        const deletes = (_a = op.delete) !== null && _a !== void 0 ? _a : [];
        const inserts = (_b = op.insert) !== null && _b !== void 0 ? _b : [];
        if (!deletes.every((pattern) => pattern.graph.equals(def))) {
            this.logger.warn('GRAPH statement in DELETE clause');
            throw new NotImplementedHttpError_1.NotImplementedHttpError('GRAPH statements are not supported');
        }
        if (!inserts.every((pattern) => pattern.graph.equals(def))) {
            this.logger.warn('GRAPH statement in INSERT clause');
            throw new NotImplementedHttpError_1.NotImplementedHttpError('GRAPH statements are not supported');
        }
        if (!(typeof op.where === 'undefined' || op.where.type === sparqlalgebrajs_1.Algebra.types.BGP)) {
            this.logger.warn('Non-BGP WHERE statements are not supported');
            throw new NotImplementedHttpError_1.NotImplementedHttpError('Non-BGP WHERE statements are not supported');
        }
    }
    /**
     * Checks if the composite update only contains supported update components.
     */
    validateComposite(op) {
        for (const update of op.updates) {
            this.validateUpdate(update);
        }
    }
    /**
     * Apply the given algebra operation to the given identifier.
     */
    async patch({ identifier, patch, representation }) {
        let result;
        let metadata;
        if (representation) {
            ({ metadata } = representation);
            if (metadata.contentType !== ContentTypes_1.INTERNAL_QUADS) {
                throw new InternalServerError_1.InternalServerError('Quad stream was expected for patching.');
            }
            result = await StreamUtil_1.readableToQuads(representation.data);
            this.logger.debug(`${result.size} quads in ${identifier.path}.`);
        }
        else {
            metadata = new RepresentationMetadata_1.RepresentationMetadata(identifier, ContentTypes_1.INTERNAL_QUADS);
            result = new n3_1.Store();
        }
        // Run the query through Comunica
        const sparql = await StreamUtil_1.readableToString(patch.data);
        const query = await this.engine.query(sparql, { sources: [result], baseIRI: identifier.path });
        await query.updateResult;
        this.logger.debug(`${result.size} quads will be stored to ${identifier.path}.`);
        return new BasicRepresentation_1.BasicRepresentation(result.match(), metadata, false);
    }
}
exports.SparqlUpdatePatcher = SparqlUpdatePatcher;
//# sourceMappingURL=SparqlUpdatePatcher.js.map