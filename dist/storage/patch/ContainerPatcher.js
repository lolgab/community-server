"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContainerPatcher = void 0;
const BasicRepresentation_1 = require("../../http/representation/BasicRepresentation");
const ContentTypes_1 = require("../../util/ContentTypes");
const NotImplementedHttpError_1 = require("../../util/errors/NotImplementedHttpError");
const PathUtil_1 = require("../../util/PathUtil");
const Vocabularies_1 = require("../../util/Vocabularies");
const RepresentationPatcher_1 = require("./RepresentationPatcher");
/**
 * A `RepresentationPatcher` specifically for patching containers.
 * A new body will be constructed from the metadata by removing all generated metadata.
 * This body will be passed to the wrapped patcher.
 */
class ContainerPatcher extends RepresentationPatcher_1.RepresentationPatcher {
    constructor(patcher) {
        super();
        this.patcher = patcher;
    }
    async canHandle(input) {
        const { identifier, representation } = input;
        if (!PathUtil_1.isContainerIdentifier(identifier)) {
            throw new NotImplementedHttpError_1.NotImplementedHttpError('Only containers are supported.');
        }
        // Verify the patcher can handle a representation containing the metadata
        let containerPlaceholder = representation;
        if (representation) {
            containerPlaceholder = new BasicRepresentation_1.BasicRepresentation([], representation.metadata, ContentTypes_1.INTERNAL_QUADS);
        }
        await this.patcher.canHandle({ ...input, representation: containerPlaceholder });
    }
    async handle(input) {
        const { identifier, representation } = input;
        if (!representation) {
            return await this.patcher.handle(input);
        }
        // Remove all generated metadata to prevent it from being stored permanently
        representation.metadata.removeQuads(representation.metadata.quads(null, null, null, Vocabularies_1.SOLID_META.terms.ResponseMetadata));
        const quads = representation.metadata.quads();
        // We do not copy the original metadata here, otherwise it would put back triples that might be deleted
        const containerRepresentation = new BasicRepresentation_1.BasicRepresentation(quads, identifier, ContentTypes_1.INTERNAL_QUADS, false);
        return await this.patcher.handle({ ...input, representation: containerRepresentation });
    }
}
exports.ContainerPatcher = ContainerPatcher;
//# sourceMappingURL=ContainerPatcher.js.map