"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubdomainIdentifierGenerator = void 0;
const PathUtil_1 = require("../../util/PathUtil");
/**
 * Generates identifiers by using the name as a subdomain on the base URL.
 * Non-alphanumeric characters will be replaced with `-`.
 */
class SubdomainIdentifierGenerator {
    constructor(baseUrl) {
        this.baseParts = PathUtil_1.extractScheme(PathUtil_1.ensureTrailingSlash(baseUrl));
    }
    generate(name) {
        // Using the punycode converter is a risk as it doesn't convert slashes for example
        const cleanName = name.replace(/\W/gu, '-');
        return { path: `${this.baseParts.scheme}${cleanName}.${this.baseParts.rest}` };
    }
}
exports.SubdomainIdentifierGenerator = SubdomainIdentifierGenerator;
//# sourceMappingURL=SubdomainIdentifierGenerator.js.map