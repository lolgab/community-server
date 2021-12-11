"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toLiteral = exports.toObjectTerm = exports.toPredicateTerm = exports.toNamedTerm = exports.isTerm = exports.toCachedNamedNode = void 0;
const n3_1 = require("n3");
const Vocabularies_1 = require("./Vocabularies");
const { namedNode, literal } = n3_1.DataFactory;
// Shorthands for commonly used predicates
const shorthands = {
    contentType: Vocabularies_1.CONTENT_TYPE_TERM,
};
// Caches named node conversions
const cachedNamedNodes = {
    ...shorthands,
};
/**
 * Converts the incoming name (URI or shorthand) to a named node.
 * The generated terms get cached to reduce the number of created nodes,
 * so only use this for internal constants!
 * @param name - Predicate to potentially transform.
 */
function toCachedNamedNode(name) {
    if (typeof name !== 'string') {
        return name;
    }
    if (!(name in cachedNamedNodes)) {
        cachedNamedNodes[name] = namedNode(name);
    }
    return cachedNamedNodes[name];
}
exports.toCachedNamedNode = toCachedNamedNode;
/**
 * @param input - Checks if this is a {@link Term}.
 */
function isTerm(input) {
    return input && typeof input.termType === 'string';
}
exports.isTerm = isTerm;
function toNamedTerm(subject) {
    return typeof subject === 'string' ? namedNode(subject) : subject;
}
exports.toNamedTerm = toNamedTerm;
exports.toPredicateTerm = toNamedTerm;
function toObjectTerm(object, preferLiteral = false) {
    if (typeof object === 'string') {
        return (preferLiteral ? literal(object) : namedNode(object));
    }
    return object;
}
exports.toObjectTerm = toObjectTerm;
/**
 * Creates a literal by first converting the dataType string to a named node.
 * @param object - Object value.
 * @param dataType - Object data type (as string).
 */
function toLiteral(object, dataType) {
    return literal(`${object}`, dataType);
}
exports.toLiteral = toLiteral;
//# sourceMappingURL=TermUtil.js.map