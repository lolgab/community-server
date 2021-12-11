"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicConditions = void 0;
const Vocabularies_1 = require("../util/Vocabularies");
const Conditions_1 = require("./Conditions");
/**
 * Stores all the relevant Conditions values and matches them based on RFC7232.
 */
class BasicConditions {
    constructor(options) {
        this.matchesETag = options.matchesETag;
        this.notMatchesETag = options.notMatchesETag;
        this.modifiedSince = options.modifiedSince;
        this.unmodifiedSince = options.unmodifiedSince;
    }
    matchesMetadata(metadata) {
        var _a;
        if (!metadata) {
            // RFC7232: ...If-Match... If the field-value is "*", the condition is false if the origin server
            // does not have a current representation for the target resource.
            return !((_a = this.matchesETag) === null || _a === void 0 ? void 0 : _a.includes('*'));
        }
        const modified = metadata.get(Vocabularies_1.DC.terms.modified);
        const modifiedDate = modified ? new Date(modified.value) : undefined;
        const etag = Conditions_1.getETag(metadata);
        return this.matches(etag, modifiedDate);
    }
    matches(eTag, lastModified) {
        var _a, _b;
        // RFC7232: ...If-None-Match... If the field-value is "*", the condition is false if the origin server
        // has a current representation for the target resource.
        if ((_a = this.notMatchesETag) === null || _a === void 0 ? void 0 : _a.includes('*')) {
            return false;
        }
        if (eTag) {
            if (this.matchesETag && !this.matchesETag.includes(eTag) && !this.matchesETag.includes('*')) {
                return false;
            }
            if ((_b = this.notMatchesETag) === null || _b === void 0 ? void 0 : _b.includes(eTag)) {
                return false;
            }
        }
        if (lastModified) {
            if (this.modifiedSince && lastModified < this.modifiedSince) {
                return false;
            }
            if (this.unmodifiedSince && lastModified > this.unmodifiedSince) {
                return false;
            }
        }
        return true;
    }
}
exports.BasicConditions = BasicConditions;
//# sourceMappingURL=BasicConditions.js.map