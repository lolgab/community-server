"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllStaticReader = void 0;
const PermissionReader_1 = require("./PermissionReader");
/**
 * PermissionReader which sets all permissions to true or false
 * independently of the identifier and requested permissions.
 */
class AllStaticReader extends PermissionReader_1.PermissionReader {
    constructor(allow) {
        super();
        this.permissions = Object.freeze({
            read: allow,
            write: allow,
            append: allow,
            create: allow,
            delete: allow,
        });
    }
    async handle({ credentials }) {
        const result = {};
        for (const [key, value] of Object.entries(credentials)) {
            if (value) {
                result[key] = this.permissions;
            }
        }
        return result;
    }
}
exports.AllStaticReader = AllStaticReader;
//# sourceMappingURL=AllStaticReader.js.map