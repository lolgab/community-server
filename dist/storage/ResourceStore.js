"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createModifiedResource = exports.ModificationType = void 0;
/**
 * The types of modification being tracked
 */
var ModificationType;
(function (ModificationType) {
    ModificationType[ModificationType["created"] = 0] = "created";
    ModificationType[ModificationType["changed"] = 1] = "changed";
    ModificationType[ModificationType["deleted"] = 2] = "deleted";
})(ModificationType = exports.ModificationType || (exports.ModificationType = {}));
/**
 * The factory functions to be used when creating modified resources in storage classes and tests.
 * This is done for convinience.
 */
function createModifiedResource(resource, modificationType) {
    return { resource, modificationType };
}
exports.createModifiedResource = createModifiedResource;
//# sourceMappingURL=ResourceStore.js.map