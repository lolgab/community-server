"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedirectResponseDescription = void 0;
const n3_1 = require("n3");
const Vocabularies_1 = require("../../../util/Vocabularies");
const RepresentationMetadata_1 = require("../../representation/RepresentationMetadata");
const ResponseDescription_1 = require("./ResponseDescription");
/**
 * Corresponds to a 301/302 response, containing the relevant location metadata.
 */
class RedirectResponseDescription extends ResponseDescription_1.ResponseDescription {
    constructor(location, permanently = false) {
        const metadata = new RepresentationMetadata_1.RepresentationMetadata({ [Vocabularies_1.SOLID_HTTP.location]: n3_1.DataFactory.namedNode(location) });
        super(permanently ? 301 : 302, metadata);
    }
}
exports.RedirectResponseDescription = RedirectResponseDescription;
//# sourceMappingURL=RedirectResponseDescription.js.map