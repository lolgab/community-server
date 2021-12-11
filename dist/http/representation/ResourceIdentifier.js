"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResourceIdentifier = exports.isResourceIdentifier = void 0;
/**
 * Determines whether the object is a `ResourceIdentifier`.
 */
function isResourceIdentifier(object) {
    return object && (typeof object.path === 'string');
}
exports.isResourceIdentifier = isResourceIdentifier;
/**
 * Factory function creating a resource identifier for convenience
 */
function createResourceIdentifier(resourcePath) {
    return { path: resourcePath };
}
exports.createResourceIdentifier = createResourceIdentifier;
//# sourceMappingURL=ResourceIdentifier.js.map