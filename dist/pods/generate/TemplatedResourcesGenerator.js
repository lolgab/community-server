"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplatedResourcesGenerator = void 0;
const fs_1 = require("fs");
const n3_1 = require("n3");
const BasicRepresentation_1 = require("../../http/representation/BasicRepresentation");
const RepresentationMetadata_1 = require("../../http/representation/RepresentationMetadata");
const ContentTypes_1 = require("../../util/ContentTypes");
const GuardedStream_1 = require("../../util/GuardedStream");
const PathUtil_1 = require("../../util/PathUtil");
const StreamUtil_1 = require("../../util/StreamUtil");
/**
 * Generates resources by making use of a template engine.
 * The template folder structure will be kept.
 * Folders will be interpreted as containers and files as documents.
 * A FileIdentifierMapper will be used to generate identifiers that correspond to the relative structure.
 *
 * A relative `templateFolder` is resolved relative to cwd,
 * unless it's preceded by `@css:`, e.g. `@css:foo/bar`.
 */
class TemplatedResourcesGenerator {
    /**
     * A mapper is needed to convert the template file paths to identifiers relative to the given base identifier.
     *
     * @param templateFolder - Folder where the templates are located.
     * @param factory - Factory used to generate mapper relative to the base identifier.
     * @param templateEngine - Template engine for generating the resources.
     * @param templateExtension - The extension of files that need to be interpreted as templates.
     *                            Will be removed to generate the identifier.
     */
    constructor(templateFolder, factory, templateEngine, templateExtension = '.hbs') {
        this.templateFolder = PathUtil_1.resolveAssetPath(templateFolder);
        this.factory = factory;
        this.templateEngine = templateEngine;
        this.templateExtension = templateExtension;
    }
    async *generate(location, options) {
        const mapper = await this.factory.create(location.path, this.templateFolder);
        const folderLink = await this.toTemplateLink(this.templateFolder, mapper);
        yield* this.processFolder(folderLink, mapper, options);
    }
    /**
     * Generates results for all entries in the given folder, including the folder itself.
     */
    async *processFolder(folderLink, mapper, options) {
        var _a;
        // Group resource links with their corresponding metadata links
        const links = await this.groupLinks(folderLink.filePath, mapper);
        // Remove root metadata if it exists
        const metaLink = (_a = links[folderLink.identifier.path]) === null || _a === void 0 ? void 0 : _a.meta;
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete links[folderLink.identifier.path];
        yield this.generateResource(folderLink, options, metaLink);
        for (const { link, meta } of Object.values(links)) {
            if (PathUtil_1.isContainerIdentifier(link.identifier)) {
                yield* this.processFolder(link, mapper, options);
            }
            else {
                yield this.generateResource(link, options, meta);
            }
        }
    }
    /**
     * Creates a TemplateResourceLink for the given filePath.
     * The identifier will be based on the file path stripped from the template extension,
     * but the filePath parameter will still point to the original file.
     */
    async toTemplateLink(filePath, mapper) {
        const stats = await fs_1.promises.lstat(filePath);
        // Slice the template extension from the filepath for correct identifier generation
        const isTemplate = filePath.endsWith(this.templateExtension);
        const slicedPath = isTemplate ? filePath.slice(0, -this.templateExtension.length) : filePath;
        const link = await mapper.mapFilePathToUrl(slicedPath, stats.isDirectory());
        // We still need the original file path for disk reading though
        return {
            ...link,
            filePath,
            isTemplate,
        };
    }
    /**
     * Generates TemplateResourceLinks for each entry in the given folder
     * and combines the results so resources and their metadata are grouped together.
     */
    async groupLinks(folderPath, mapper) {
        const files = await fs_1.promises.readdir(folderPath);
        const links = {};
        for (const name of files) {
            const link = await this.toTemplateLink(PathUtil_1.joinFilePath(folderPath, name), mapper);
            const { path } = link.identifier;
            links[path] = Object.assign(links[path] || {}, link.isMetadata ? { meta: link } : { link });
        }
        return links;
    }
    /**
     * Generates a Resource object for the given ResourceLink.
     * In the case of documents the corresponding template will be used.
     * If a ResourceLink of metadata is provided the corresponding data will be added as metadata.
     */
    async generateResource(link, options, metaLink) {
        let data;
        const metadata = new RepresentationMetadata_1.RepresentationMetadata(link.identifier);
        // Read file if it is not a container
        if (PathUtil_1.isContainerIdentifier(link.identifier)) {
            // Containers need to be an RDF type
            metadata.contentType = ContentTypes_1.TEXT_TURTLE;
        }
        else {
            data = await this.processFile(link, options);
            metadata.contentType = link.contentType;
        }
        // Add metadata from meta file if there is one
        if (metaLink) {
            const rawMetadata = await this.generateMetadata(metaLink, options);
            metadata.addQuads(rawMetadata.quads());
        }
        return {
            identifier: link.identifier,
            representation: new BasicRepresentation_1.BasicRepresentation(data !== null && data !== void 0 ? data : [], metadata),
        };
    }
    /**
     * Generates a RepresentationMetadata using the given template.
     */
    async generateMetadata(metaLink, options) {
        const metadata = new RepresentationMetadata_1.RepresentationMetadata(metaLink.identifier);
        const data = await this.processFile(metaLink, options);
        const parser = new n3_1.Parser({ format: metaLink.contentType, baseIRI: metaLink.identifier.path });
        const quads = parser.parse(await StreamUtil_1.readableToString(data));
        metadata.addQuads(quads);
        return metadata;
    }
    /**
     * Creates a read stream from the file and applies the template if necessary.
     */
    async processFile(link, options) {
        if (link.isTemplate) {
            const rendered = await this.templateEngine.render(options, { templateFile: link.filePath });
            return StreamUtil_1.guardedStreamFrom(rendered);
        }
        return GuardedStream_1.guardStream(fs_1.createReadStream(link.filePath));
    }
}
exports.TemplatedResourcesGenerator = TemplatedResourcesGenerator;
//# sourceMappingURL=TemplatedResourcesGenerator.js.map