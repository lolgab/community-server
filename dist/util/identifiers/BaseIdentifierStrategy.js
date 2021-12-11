"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseIdentifierStrategy = void 0;
const InternalServerError_1 = require("../errors/InternalServerError");
const PathUtil_1 = require("../PathUtil");
/**
 * Provides a default implementation for `getParentContainer`
 * which checks if the identifier is supported and not a root container.
 * If not, the last part before the first relevant slash will be removed to find the parent.
 */
class BaseIdentifierStrategy {
    getParentContainer(identifier) {
        if (!this.supportsIdentifier(identifier)) {
            throw new InternalServerError_1.InternalServerError(`The identifier ${identifier.path} is outside the configured identifier space.`, { errorCode: 'E0001', details: { path: identifier.path } });
        }
        if (this.isRootContainer(identifier)) {
            throw new InternalServerError_1.InternalServerError(`Cannot obtain the parent of ${identifier.path} because it is a root container.`);
        }
        // Trailing slash is necessary for URL library
        const parentPath = new URL('..', PathUtil_1.ensureTrailingSlash(identifier.path)).href;
        return { path: parentPath };
    }
}
exports.BaseIdentifierStrategy = BaseIdentifierStrategy;
//# sourceMappingURL=BaseIdentifierStrategy.js.map