"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepresentationMetadata = exports.isRepresentationMetadata = void 0;
const n3_1 = require("n3");
const LogUtil_1 = require("../../logging/LogUtil");
const InternalServerError_1 = require("../../util/errors/InternalServerError");
const TermUtil_1 = require("../../util/TermUtil");
const Vocabularies_1 = require("../../util/Vocabularies");
const ResourceIdentifier_1 = require("./ResourceIdentifier");
/**
 * Determines whether the object is a `RepresentationMetadata`.
 */
function isRepresentationMetadata(object) {
    return typeof (object === null || object === void 0 ? void 0 : object.setMetadata) === 'function';
}
exports.isRepresentationMetadata = isRepresentationMetadata;
/**
 * Stores the metadata triples and provides methods for easy access.
 * Most functions return the metadata object to allow for chaining.
 */
class RepresentationMetadata {
    constructor(input, overrides) {
        this.logger = LogUtil_1.getLoggerFor(this);
        this.store = new n3_1.Store();
        if (ResourceIdentifier_1.isResourceIdentifier(input)) {
            this.id = n3_1.DataFactory.namedNode(input.path);
        }
        else if (TermUtil_1.isTerm(input)) {
            this.id = input;
        }
        else if (isRepresentationMetadata(input)) {
            this.id = input.identifier;
            this.addQuads(input.quads());
        }
        else {
            overrides = input;
            this.id = this.store.createBlankNode();
        }
        if (overrides) {
            if (typeof overrides === 'string') {
                overrides = { [Vocabularies_1.CONTENT_TYPE]: overrides };
            }
            this.setOverrides(overrides);
        }
    }
    setOverrides(overrides) {
        for (const predicate of Object.keys(overrides)) {
            const namedPredicate = TermUtil_1.toCachedNamedNode(predicate);
            this.removeAll(namedPredicate);
            let objects = overrides[predicate];
            if (!Array.isArray(objects)) {
                objects = [objects];
            }
            for (const object of objects) {
                this.store.addQuad(this.id, namedPredicate, TermUtil_1.toObjectTerm(object, true));
            }
        }
    }
    /**
     * @returns All matching metadata quads.
     */
    quads(subject = null, predicate = null, object = null, graph = null) {
        return this.store.getQuads(subject, predicate, object, graph);
    }
    /**
     * Identifier of the resource this metadata is relevant to.
     * Will update all relevant triples if this value gets changed.
     */
    get identifier() {
        return this.id;
    }
    set identifier(id) {
        if (!id.equals(this.id)) {
            // Convert all instances of the old identifier to the new identifier in the stored quads
            const quads = this.quads().map((quad) => {
                if (quad.subject.equals(this.id)) {
                    return n3_1.DataFactory.quad(id, quad.predicate, quad.object, quad.graph);
                }
                if (quad.object.equals(this.id)) {
                    return n3_1.DataFactory.quad(quad.subject, quad.predicate, id, quad.graph);
                }
                return quad;
            });
            this.store = new n3_1.Store(quads);
            this.id = id;
        }
    }
    /**
     * Helper function to import all entries from the given metadata.
     * If the new metadata has a different identifier the internal one will be updated.
     * @param metadata - Metadata to import.
     */
    setMetadata(metadata) {
        this.identifier = metadata.identifier;
        this.addQuads(metadata.quads());
        return this;
    }
    /**
     * @param subject - Subject of quad to add.
     * @param predicate - Predicate of quad to add.
     * @param object - Object of quad to add.
     * @param graph - Optional graph of quad to add.
     */
    addQuad(subject, predicate, object, graph) {
        this.store.addQuad(TermUtil_1.toNamedTerm(subject), TermUtil_1.toCachedNamedNode(predicate), TermUtil_1.toObjectTerm(object, true), graph ? TermUtil_1.toNamedTerm(graph) : undefined);
        return this;
    }
    /**
     * @param quads - Quads to add to the metadata.
     */
    addQuads(quads) {
        this.store.addQuads(quads);
        return this;
    }
    /**
     * @param subject - Subject of quad to remove.
     * @param predicate - Predicate of quad to remove.
     * @param object - Object of quad to remove.
     * @param graph - Optional graph of quad to remove.
     */
    removeQuad(subject, predicate, object, graph) {
        const quads = this.quads(TermUtil_1.toNamedTerm(subject), TermUtil_1.toCachedNamedNode(predicate), TermUtil_1.toObjectTerm(object, true), graph ? TermUtil_1.toNamedTerm(graph) : undefined);
        return this.removeQuads(quads);
    }
    /**
     * @param quads - Quads to remove from the metadata.
     */
    removeQuads(quads) {
        this.store.removeQuads(quads);
        return this;
    }
    /**
     * Adds a value linked to the identifier. Strings get converted to literals.
     * @param predicate - Predicate linking identifier to value.
     * @param object - Value(s) to add.
     * @param graph - Optional graph of where to add the values to.
     */
    add(predicate, object, graph) {
        return this.forQuads(predicate, object, (pred, obj) => this.addQuad(this.id, pred, obj, graph));
    }
    /**
     * Removes the given value from the metadata. Strings get converted to literals.
     * @param predicate - Predicate linking identifier to value.
     * @param object - Value(s) to remove.
     * @param graph - Optional graph of where to remove the values from.
     */
    remove(predicate, object, graph) {
        return this.forQuads(predicate, object, (pred, obj) => this.removeQuad(this.id, pred, obj, graph));
    }
    /**
     * Helper function to simplify add/remove
     * Runs the given function on all predicate/object pairs, but only converts the predicate to a named node once.
     */
    forQuads(predicate, object, forFn) {
        const predicateNode = TermUtil_1.toCachedNamedNode(predicate);
        const objects = Array.isArray(object) ? object : [object];
        for (const obj of objects) {
            forFn(predicateNode, TermUtil_1.toObjectTerm(obj, true));
        }
        return this;
    }
    /**
     * Removes all values linked through the given predicate.
     * @param predicate - Predicate to remove.
     * @param graph - Optional graph where to remove from.
     */
    removeAll(predicate, graph) {
        this.removeQuads(this.store.getQuads(this.id, TermUtil_1.toCachedNamedNode(predicate), null, graph !== null && graph !== void 0 ? graph : null));
        return this;
    }
    /**
     * Finds all object values matching the given predicate and/or graph.
     * @param predicate - Optional predicate to get the values for.
     * @param graph - Optional graph where to get from.
     *
     * @returns An array with all matches.
     */
    getAll(predicate, graph) {
        return this.store.getQuads(this.id, TermUtil_1.toCachedNamedNode(predicate), null, graph !== null && graph !== void 0 ? graph : null)
            .map((quad) => quad.object);
    }
    /**
     * @param predicate - Predicate to get the value for.
     * @param graph - Optional graph where the triple should be found.
     *
     * @throws Error
     * If there are multiple matching values.
     *
     * @returns The corresponding value. Undefined if there is no match
     */
    get(predicate, graph) {
        const terms = this.getAll(predicate, graph);
        if (terms.length === 0) {
            return;
        }
        if (terms.length > 1) {
            this.logger.error(`Multiple results for ${typeof predicate === 'string' ? predicate : predicate.value}`);
            throw new InternalServerError_1.InternalServerError(`Multiple results for ${typeof predicate === 'string' ? predicate : predicate.value}`);
        }
        return terms[0];
    }
    /**
     * Sets the value for the given predicate, removing all other instances.
     * In case the object is undefined this is identical to `removeAll(predicate)`.
     * @param predicate - Predicate linking to the value.
     * @param object - Value(s) to set.
     * @param graph - Optional graph where the triple should be stored.
     */
    set(predicate, object, graph) {
        this.removeAll(predicate, graph);
        if (object) {
            this.add(predicate, object, graph);
        }
        return this;
    }
    // Syntactic sugar for common predicates
    /**
     * Shorthand for the CONTENT_TYPE predicate.
     */
    get contentType() {
        var _a;
        return (_a = this.get(Vocabularies_1.CONTENT_TYPE_TERM)) === null || _a === void 0 ? void 0 : _a.value;
    }
    set contentType(input) {
        this.set(Vocabularies_1.CONTENT_TYPE_TERM, input);
    }
}
exports.RepresentationMetadata = RepresentationMetadata;
//# sourceMappingURL=RepresentationMetadata.js.map