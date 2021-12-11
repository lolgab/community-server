"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkMetadataGenerator = void 0;
const data_model_1 = require("@rdfjs/data-model");
const Vocabularies_1 = require("../../util/Vocabularies");
const MetadataGenerator_1 = require("./MetadataGenerator");
/**
 * Adds a link to the auxiliary resource when called on the subject resource.
 * Specifically: <subjectId> <link> <auxiliaryId> will be added.
 *
 * In case the input is metadata of an auxiliary resource no metadata will be added
 */
class LinkMetadataGenerator extends MetadataGenerator_1.MetadataGenerator {
    constructor(link, identifierStrategy) {
        super();
        this.link = link;
        this.identifierStrategy = identifierStrategy;
    }
    async handle(metadata) {
        const identifier = { path: metadata.identifier.value };
        if (!this.identifierStrategy.isAuxiliaryIdentifier(identifier)) {
            metadata.add(this.link, data_model_1.namedNode(this.identifierStrategy.getAuxiliaryIdentifier(identifier).path), Vocabularies_1.SOLID_META.terms.ResponseMetadata);
        }
    }
}
exports.LinkMetadataGenerator = LinkMetadataGenerator;
//# sourceMappingURL=LinkMetadataGenerator.js.map