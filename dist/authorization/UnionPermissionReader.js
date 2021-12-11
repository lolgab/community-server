"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnionPermissionReader = void 0;
const UnionHandler_1 = require("../util/handlers/UnionHandler");
/**
 * Combines the results of multiple PermissionReaders.
 * Every permission in every credential type is handled according to the rule `false` \> `true` \> `undefined`.
 */
class UnionPermissionReader extends UnionHandler_1.UnionHandler {
    constructor(readers) {
        super(readers);
    }
    async combine(results) {
        const result = {};
        for (const permissionSet of results) {
            for (const [key, value] of Object.entries(permissionSet)) {
                result[key] = this.applyPermissions(value, result[key]);
            }
        }
        return result;
    }
    /**
     * Adds the given permissions to the result object according to the combination rules of the class.
     */
    applyPermissions(permissions, result = {}) {
        if (!permissions) {
            return result;
        }
        for (const [key, value] of Object.entries(permissions)) {
            if (typeof value !== 'undefined' && result[key] !== false) {
                result[key] = value;
            }
        }
        return result;
    }
}
exports.UnionPermissionReader = UnionPermissionReader;
//# sourceMappingURL=UnionPermissionReader.js.map