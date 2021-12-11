"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebAclMetadataCollector = void 0;
const AclPermission_1 = require("../../../authorization/permissions/AclPermission");
const Permissions_1 = require("../../../authorization/permissions/Permissions");
const Vocabularies_1 = require("../../../util/Vocabularies");
const OperationMetadataCollector_1 = require("./OperationMetadataCollector");
const VALID_METHODS = new Set(['HEAD', 'GET']);
const VALID_ACL_MODES = new Set([Permissions_1.AccessMode.read, Permissions_1.AccessMode.write, Permissions_1.AccessMode.append, AclPermission_1.AclMode.control]);
/**
 * Indicates which acl permissions are available on the requested resource.
 * Only adds public and agent permissions for HEAD/GET requests.
 */
class WebAclMetadataCollector extends OperationMetadataCollector_1.OperationMetadataCollector {
    async handle({ metadata, operation }) {
        var _a, _b;
        if (!operation.permissionSet || !VALID_METHODS.has(operation.method)) {
            return;
        }
        const user = (_a = operation.permissionSet.agent) !== null && _a !== void 0 ? _a : {};
        const everyone = (_b = operation.permissionSet.public) !== null && _b !== void 0 ? _b : {};
        const modes = new Set([...Object.keys(user), ...Object.keys(everyone)]);
        for (const mode of modes) {
            if (VALID_ACL_MODES.has(mode)) {
                const capitalizedMode = mode.charAt(0).toUpperCase() + mode.slice(1);
                if (everyone[mode]) {
                    metadata.add(Vocabularies_1.AUTH.terms.publicMode, Vocabularies_1.ACL.terms[capitalizedMode]);
                }
                if (user[mode]) {
                    metadata.add(Vocabularies_1.AUTH.terms.userMode, Vocabularies_1.ACL.terms[capitalizedMode]);
                }
            }
        }
    }
}
exports.WebAclMetadataCollector = WebAclMetadataCollector;
//# sourceMappingURL=WebAclMetadataCollector.js.map