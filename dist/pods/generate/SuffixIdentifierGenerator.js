"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuffixIdentifierGenerator = void 0;
const PathUtil_1 = require("../../util/PathUtil");
/**
 * Generates identifiers by appending the name to a stored base identifier.
 * Non-alphanumeric characters will be replaced with `-`.
 */
class SuffixIdentifierGenerator {
    constructor(base) {
        this.base = base;
    }
    generate(name) {
        const cleanName = name.replace(/\W/gu, '-');
        return { path: PathUtil_1.ensureTrailingSlash(new URL(cleanName, this.base).href) };
    }
}
exports.SuffixIdentifierGenerator = SuffixIdentifierGenerator;
//# sourceMappingURL=SuffixIdentifierGenerator.js.map