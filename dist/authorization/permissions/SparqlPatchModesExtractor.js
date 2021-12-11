"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SparqlPatchModesExtractor = void 0;
const sparqlalgebrajs_1 = require("sparqlalgebrajs");
const NotImplementedHttpError_1 = require("../../util/errors/NotImplementedHttpError");
const ModesExtractor_1 = require("./ModesExtractor");
const Permissions_1 = require("./Permissions");
class SparqlPatchModesExtractor extends ModesExtractor_1.ModesExtractor {
    async canHandle({ method, body }) {
        if (method !== 'PATCH') {
            throw new NotImplementedHttpError_1.NotImplementedHttpError(`Cannot determine permissions of ${method}, only PATCH.`);
        }
        if (!this.isSparql(body)) {
            throw new NotImplementedHttpError_1.NotImplementedHttpError('Cannot determine permissions of non-SPARQL patches.');
        }
        if (!this.isSupported(body.algebra)) {
            throw new NotImplementedHttpError_1.NotImplementedHttpError('Can only determine permissions of a PATCH with DELETE/INSERT operations.');
        }
    }
    async handle({ body }) {
        // Verified in `canHandle` call
        const update = body.algebra;
        const result = new Set();
        // Since `append` is a specific type of write, it is true if `write` is true.
        if (this.needsWrite(update)) {
            result.add(Permissions_1.AccessMode.write);
            result.add(Permissions_1.AccessMode.append);
            result.add(Permissions_1.AccessMode.create);
            result.add(Permissions_1.AccessMode.delete);
        }
        else if (this.needsAppend(update)) {
            result.add(Permissions_1.AccessMode.append);
        }
        return result;
    }
    isSparql(data) {
        return Boolean(data.algebra);
    }
    isSupported(op) {
        if (this.isDeleteInsert(op) || this.isNop(op)) {
            return true;
        }
        if (op.type === sparqlalgebrajs_1.Algebra.types.COMPOSITE_UPDATE) {
            return op.updates.every((update) => this.isSupported(update));
        }
        return false;
    }
    isDeleteInsert(op) {
        return op.type === sparqlalgebrajs_1.Algebra.types.DELETE_INSERT;
    }
    isNop(op) {
        return op.type === sparqlalgebrajs_1.Algebra.types.NOP;
    }
    needsAppend(update) {
        if (this.isNop(update)) {
            return false;
        }
        if (this.isDeleteInsert(update)) {
            return Boolean(update.insert && update.insert.length > 0);
        }
        return update.updates.some((op) => this.needsAppend(op));
    }
    needsWrite(update) {
        if (this.isNop(update)) {
            return false;
        }
        if (this.isDeleteInsert(update)) {
            return Boolean(update.delete && update.delete.length > 0);
        }
        return update.updates.some((op) => this.needsWrite(op));
    }
}
exports.SparqlPatchModesExtractor = SparqlPatchModesExtractor;
//# sourceMappingURL=SparqlPatchModesExtractor.js.map