"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MethodModesExtractor = void 0;
const NotImplementedHttpError_1 = require("../../util/errors/NotImplementedHttpError");
const ModesExtractor_1 = require("./ModesExtractor");
const Permissions_1 = require("./Permissions");
const READ_METHODS = new Set(['GET', 'HEAD']);
const WRITE_METHODS = new Set(['PUT', 'DELETE']);
const APPEND_METHODS = new Set(['POST']);
const SUPPORTED_METHODS = new Set([...READ_METHODS, ...WRITE_METHODS, ...APPEND_METHODS]);
/**
 * Generates permissions for the base set of methods that always require the same permissions.
 * Specifically: GET, HEAD, POST, PUT and DELETE.
 */
class MethodModesExtractor extends ModesExtractor_1.ModesExtractor {
    async canHandle({ method }) {
        if (!SUPPORTED_METHODS.has(method)) {
            throw new NotImplementedHttpError_1.NotImplementedHttpError(`Cannot determine permissions of ${method}`);
        }
    }
    async handle({ method }) {
        const result = new Set();
        if (READ_METHODS.has(method)) {
            result.add(Permissions_1.AccessMode.read);
        }
        if (WRITE_METHODS.has(method)) {
            result.add(Permissions_1.AccessMode.write);
            result.add(Permissions_1.AccessMode.append);
            result.add(Permissions_1.AccessMode.create);
            result.add(Permissions_1.AccessMode.delete);
        }
        else if (APPEND_METHODS.has(method)) {
            result.add(Permissions_1.AccessMode.append);
        }
        return result;
    }
}
exports.MethodModesExtractor = MethodModesExtractor;
//# sourceMappingURL=MethodModesExtractor.js.map