"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileDataAccessor = void 0;
const fs_1 = require("fs");
const RepresentationMetadata_1 = require("../../http/representation/RepresentationMetadata");
const NotFoundHttpError_1 = require("../../util/errors/NotFoundHttpError");
const SystemError_1 = require("../../util/errors/SystemError");
const UnsupportedMediaTypeHttpError_1 = require("../../util/errors/UnsupportedMediaTypeHttpError");
const GuardedStream_1 = require("../../util/GuardedStream");
const PathUtil_1 = require("../../util/PathUtil");
const QuadUtil_1 = require("../../util/QuadUtil");
const ResourceUtil_1 = require("../../util/ResourceUtil");
const TermUtil_1 = require("../../util/TermUtil");
const Vocabularies_1 = require("../../util/Vocabularies");
/**
 * DataAccessor that uses the file system to store documents as files and containers as folders.
 */
class FileDataAccessor {
    constructor(resourceMapper) {
        this.resourceMapper = resourceMapper;
    }
    /**
     * Only binary data can be directly stored as files so will error on non-binary data.
     */
    async canHandle(representation) {
        if (!representation.binary) {
            throw new UnsupportedMediaTypeHttpError_1.UnsupportedMediaTypeHttpError('Only binary data is supported.');
        }
    }
    /**
     * Will return data stream directly to the file corresponding to the resource.
     * Will throw NotFoundHttpError if the input is a container.
     */
    async getData(identifier) {
        const link = await this.resourceMapper.mapUrlToFilePath(identifier, false);
        const stats = await this.getStats(link.filePath);
        if (stats.isFile()) {
            return GuardedStream_1.guardStream(fs_1.createReadStream(link.filePath));
        }
        throw new NotFoundHttpError_1.NotFoundHttpError();
    }
    /**
     * Will return corresponding metadata by reading the metadata file (if it exists)
     * and adding file system specific metadata elements.
     */
    async getMetadata(identifier) {
        const link = await this.resourceMapper.mapUrlToFilePath(identifier, false);
        const stats = await this.getStats(link.filePath);
        if (!PathUtil_1.isContainerIdentifier(identifier) && stats.isFile()) {
            return this.getFileMetadata(link, stats);
        }
        if (PathUtil_1.isContainerIdentifier(identifier) && stats.isDirectory()) {
            return this.getDirectoryMetadata(link, stats);
        }
        throw new NotFoundHttpError_1.NotFoundHttpError();
    }
    async *getChildren(identifier) {
        const link = await this.resourceMapper.mapUrlToFilePath(identifier, false);
        yield* this.getChildMetadata(link);
    }
    /**
     * Writes the given data as a file (and potential metadata as additional file).
     * The metadata file will be written first and will be deleted if something goes wrong writing the actual data.
     */
    async writeDocument(identifier, data, metadata) {
        const link = await this.resourceMapper.mapUrlToFilePath(identifier, false, metadata.contentType);
        // Check if we already have a corresponding file with a different extension
        await this.verifyExistingExtension(link);
        const wroteMetadata = await this.writeMetadata(link, metadata);
        try {
            await this.writeDataFile(link.filePath, data);
        }
        catch (error) {
            // Delete the metadata if there was an error writing the file
            if (wroteMetadata) {
                const metaLink = await this.resourceMapper.mapUrlToFilePath(identifier, true);
                await fs_1.promises.unlink(metaLink.filePath);
            }
            throw error;
        }
    }
    /**
     * Creates corresponding folder if necessary and writes metadata to metadata file if necessary.
     */
    async writeContainer(identifier, metadata) {
        const link = await this.resourceMapper.mapUrlToFilePath(identifier, false);
        try {
            await fs_1.promises.mkdir(link.filePath, { recursive: true });
        }
        catch (error) {
            // Don't throw if directory already exists
            if (!SystemError_1.isSystemError(error) || error.code !== 'EEXIST') {
                throw error;
            }
        }
        await this.writeMetadata(link, metadata);
    }
    /**
     * Removes the corresponding file/folder (and metadata file).
     */
    async deleteResource(identifier) {
        const link = await this.resourceMapper.mapUrlToFilePath(identifier, false);
        const stats = await this.getStats(link.filePath);
        try {
            const metaLink = await this.resourceMapper.mapUrlToFilePath(identifier, true);
            await fs_1.promises.unlink(metaLink.filePath);
        }
        catch (error) {
            // Ignore if it doesn't exist
            if (!SystemError_1.isSystemError(error) || error.code !== 'ENOENT') {
                throw error;
            }
        }
        if (!PathUtil_1.isContainerIdentifier(identifier) && stats.isFile()) {
            await fs_1.promises.unlink(link.filePath);
        }
        else if (PathUtil_1.isContainerIdentifier(identifier) && stats.isDirectory()) {
            await fs_1.promises.rmdir(link.filePath);
        }
        else {
            throw new NotFoundHttpError_1.NotFoundHttpError();
        }
    }
    /**
     * Gets the Stats object corresponding to the given file path,
     * resolving symbolic links.
     * @param path - File path to get info from.
     *
     * @throws NotFoundHttpError
     * If the file/folder doesn't exist.
     */
    async getStats(path) {
        try {
            return await fs_1.promises.stat(path);
        }
        catch (error) {
            if (SystemError_1.isSystemError(error) && error.code === 'ENOENT') {
                throw new NotFoundHttpError_1.NotFoundHttpError('', { cause: error });
            }
            throw error;
        }
    }
    /**
     * Reads and generates all metadata relevant for the given file,
     * ingesting it into a RepresentationMetadata object.
     *
     * @param link - Path related metadata.
     * @param stats - Stats object of the corresponding file.
     */
    async getFileMetadata(link, stats) {
        return (await this.getBaseMetadata(link, stats, false))
            .set(Vocabularies_1.CONTENT_TYPE, link.contentType);
    }
    /**
     * Reads and generates all metadata relevant for the given directory,
     * ingesting it into a RepresentationMetadata object.
     *
     * @param link - Path related metadata.
     * @param stats - Stats object of the corresponding directory.
     */
    async getDirectoryMetadata(link, stats) {
        return await this.getBaseMetadata(link, stats, true);
    }
    /**
     * Writes the metadata of the resource to a meta file.
     * @param link - Path related metadata of the resource.
     * @param metadata - Metadata to write.
     *
     * @returns True if data was written to a file.
     */
    async writeMetadata(link, metadata) {
        // These are stored by file system conventions
        metadata.remove(Vocabularies_1.RDF.terms.type, Vocabularies_1.LDP.terms.Resource);
        metadata.remove(Vocabularies_1.RDF.terms.type, Vocabularies_1.LDP.terms.Container);
        metadata.remove(Vocabularies_1.RDF.terms.type, Vocabularies_1.LDP.terms.BasicContainer);
        metadata.removeAll(Vocabularies_1.DC.terms.modified);
        metadata.removeAll(Vocabularies_1.CONTENT_TYPE);
        const quads = metadata.quads();
        const metadataLink = await this.resourceMapper.mapUrlToFilePath(link.identifier, true);
        let wroteMetadata;
        // Write metadata to file if there are quads remaining
        if (quads.length > 0) {
            // Determine required content-type based on mapper
            const serializedMetadata = QuadUtil_1.serializeQuads(quads, metadataLink.contentType);
            await this.writeDataFile(metadataLink.filePath, serializedMetadata);
            wroteMetadata = true;
            // Delete (potentially) existing metadata file if no metadata needs to be stored
        }
        else {
            try {
                await fs_1.promises.unlink(metadataLink.filePath);
            }
            catch (error) {
                // Metadata file doesn't exist so nothing needs to be removed
                if (!SystemError_1.isSystemError(error) || error.code !== 'ENOENT') {
                    throw error;
                }
            }
            wroteMetadata = false;
        }
        return wroteMetadata;
    }
    /**
     * Generates metadata relevant for any resources stored by this accessor.
     * @param link - Path related metadata.
     * @param stats - Stats objects of the corresponding directory.
     * @param isContainer - If the path points to a container (directory) or not.
     */
    async getBaseMetadata(link, stats, isContainer) {
        const metadata = new RepresentationMetadata_1.RepresentationMetadata(link.identifier)
            .addQuads(await this.getRawMetadata(link.identifier));
        ResourceUtil_1.addResourceMetadata(metadata, isContainer);
        this.addPosixMetadata(metadata, stats);
        return metadata;
    }
    /**
     * Reads the metadata from the corresponding metadata file.
     * Returns an empty array if there is no metadata file.
     *
     * @param identifier - Identifier of the resource (not the metadata!).
     */
    async getRawMetadata(identifier) {
        try {
            const metadataLink = await this.resourceMapper.mapUrlToFilePath(identifier, true);
            // Check if the metadata file exists first
            await fs_1.promises.lstat(metadataLink.filePath);
            const readMetadataStream = GuardedStream_1.guardStream(fs_1.createReadStream(metadataLink.filePath));
            return await QuadUtil_1.parseQuads(readMetadataStream, { format: metadataLink.contentType, baseIRI: identifier.path });
        }
        catch (error) {
            // Metadata file doesn't exist so lets keep `rawMetaData` an empty array.
            if (!SystemError_1.isSystemError(error) || error.code !== 'ENOENT') {
                throw error;
            }
            return [];
        }
    }
    /**
     * Generate metadata for all children in a container.
     *
     * @param link - Path related metadata.
     */
    async *getChildMetadata(link) {
        const dir = await fs_1.promises.opendir(link.filePath);
        // For every child in the container we want to generate specific metadata
        for await (const entry of dir) {
            // Obtain details of the entry, resolving any symbolic links
            const childPath = PathUtil_1.joinFilePath(link.filePath, entry.name);
            let childStats;
            try {
                childStats = await this.getStats(childPath);
            }
            catch {
                // Skip this entry if details could not be retrieved (e.g., bad symbolic link)
                continue;
            }
            // Ignore non-file/directory entries in the folder
            if (!childStats.isFile() && !childStats.isDirectory()) {
                continue;
            }
            // Generate the URI corresponding to the child resource
            const childLink = await this.resourceMapper.mapFilePathToUrl(childPath, childStats.isDirectory());
            // Hide metadata files
            if (childLink.isMetadata) {
                continue;
            }
            // Generate metadata of this specific child
            const metadata = new RepresentationMetadata_1.RepresentationMetadata(childLink.identifier);
            ResourceUtil_1.addResourceMetadata(metadata, childStats.isDirectory());
            this.addPosixMetadata(metadata, childStats);
            yield metadata;
        }
    }
    /**
     * Helper function to add file system related metadata.
     * @param metadata - metadata object to add to
     * @param stats - Stats of the file/directory corresponding to the resource.
     */
    addPosixMetadata(metadata, stats) {
        ResourceUtil_1.updateModifiedDate(metadata, stats.mtime);
        metadata.add(Vocabularies_1.POSIX.terms.mtime, TermUtil_1.toLiteral(Math.floor(stats.mtime.getTime() / 1000), Vocabularies_1.XSD.terms.integer), Vocabularies_1.SOLID_META.terms.ResponseMetadata);
        if (!stats.isDirectory()) {
            metadata.add(Vocabularies_1.POSIX.terms.size, TermUtil_1.toLiteral(stats.size, Vocabularies_1.XSD.terms.integer), Vocabularies_1.SOLID_META.terms.ResponseMetadata);
        }
    }
    /**
     * Verifies if there already is a file corresponding to the given resource.
     * If yes, that file is removed if it does not match the path given in the input ResourceLink.
     * This can happen if the content-type differs from the one that was stored.
     *
     * @param link - ResourceLink corresponding to the new resource data.
     */
    async verifyExistingExtension(link) {
        try {
            // Delete the old file with the (now) wrong extension
            const oldLink = await this.resourceMapper.mapUrlToFilePath(link.identifier, false);
            if (oldLink.filePath !== link.filePath) {
                await fs_1.promises.unlink(oldLink.filePath);
            }
        }
        catch (error) {
            // Ignore it if the file didn't exist yet and couldn't be unlinked
            if (!SystemError_1.isSystemError(error) || error.code !== 'ENOENT') {
                throw error;
            }
        }
    }
    /**
     * Helper function without extra validation checking to create a data file.
     * @param path - The filepath of the file to be created.
     * @param data - The data to be put in the file.
     */
    async writeDataFile(path, data) {
        return new Promise((resolve, reject) => {
            const writeStream = fs_1.createWriteStream(path);
            data.pipe(writeStream);
            data.on('error', reject);
            writeStream.on('error', reject);
            writeStream.on('finish', resolve);
        });
    }
}
exports.FileDataAccessor = FileDataAccessor;
//# sourceMappingURL=FileDataAccessor.js.map