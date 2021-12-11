"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainedConverter = void 0;
const LogUtil_1 = require("../../logging/LogUtil");
const BadRequestHttpError_1 = require("../../util/errors/BadRequestHttpError");
const NotImplementedHttpError_1 = require("../../util/errors/NotImplementedHttpError");
const ConversionUtil_1 = require("./ConversionUtil");
const RepresentationConverter_1 = require("./RepresentationConverter");
/**
 * A meta converter that takes an array of other converters as input.
 * It chains these converters by finding a path of converters
 * that can go from the given content-type to the given type preferences.
 * In case there are multiple paths, the one with the highest weight gets found.
 * Will error in case no path can be found.
 *
 * This is not a TypedRepresentationConverter since the supported output types
 * might depend on what is the input content-type.
 *
 * This converter should be the last in a WaterfallHandler if there are multiple,
 * since it will try to convert any representation with a content-type.
 *
 * Some suggestions on how this class can be even more optimized should this ever be needed in the future.
 * Most of these decrease computation time at the cost of more memory.
 *  - The algorithm could start on both ends of a possible path and work towards the middle.
 *  - When creating a path, store the list of unused converters instead of checking every step.
 *  - Caching: https://github.com/solid/community-server/issues/832
 */
class ChainedConverter extends RepresentationConverter_1.RepresentationConverter {
    constructor(converters) {
        super();
        this.logger = LogUtil_1.getLoggerFor(this);
        if (converters.length === 0) {
            throw new Error('At least 1 converter is required.');
        }
        this.converters = [...converters];
    }
    async canHandle(input) {
        const type = input.representation.metadata.contentType;
        if (!type) {
            throw new BadRequestHttpError_1.BadRequestHttpError('Missing Content-Type header.');
        }
    }
    async handle(input) {
        const match = await this.findPath(input);
        // No conversion needed
        if (!this.isMatchedPath(match)) {
            return input.representation;
        }
        const { path, inType, outType } = match;
        this.logger.debug(`Converting ${inType} -> ${[...path.intermediateTypes, outType].join(' -> ')}.`);
        const args = { ...input };
        for (let i = 0; i < path.converters.length - 1; ++i) {
            const type = path.intermediateTypes[i];
            args.preferences = { type: { [type]: 1 } };
            args.representation = await path.converters[i].handle(args);
        }
        // For the last converter we set the preferences to the best output type
        args.preferences = { type: { [outType]: 1 } };
        return path.converters.slice(-1)[0].handle(args);
    }
    isMatchedPath(path) {
        return typeof path.path === 'object';
    }
    /**
     * Finds a conversion path that can handle the given input.
     */
    async findPath(input) {
        const type = input.representation.metadata.contentType;
        const preferences = ConversionUtil_1.cleanPreferences(input.preferences.type);
        const weight = ConversionUtil_1.getTypeWeight(type, preferences);
        if (weight > 0) {
            this.logger.debug(`No conversion required: ${type} already matches ${Object.keys(preferences)}`);
            return { value: type, weight };
        }
        return this.generatePath(type, preferences);
    }
    /**
     * Tries to generate the optimal `ConversionPath` that supports the given parameters,
     * which will then be used to instantiate a specific `MatchedPath` for those parameters.
     *
     * Errors if such a path does not exist.
     */
    async generatePath(inType, outPreferences) {
        // Generate paths from all converters that match the input type
        let paths = await this.converters.reduce(async (matches, converter) => {
            const inTypes = await converter.getInputTypes();
            if (ConversionUtil_1.getTypeWeight(inType, inTypes) > 0) {
                (await matches).push({
                    converters: [converter],
                    intermediateTypes: [],
                    inTypes,
                    outTypes: await converter.getOutputTypes(),
                });
            }
            return matches;
        }, Promise.resolve([]));
        // It's impossible for a path to have a higher weight than this value
        const maxWeight = Math.max(...Object.values(outPreferences));
        let bestPath = this.findBest(inType, outPreferences, paths);
        paths = this.removeBadPaths(paths, maxWeight, inType, bestPath);
        // This will always stop at some point since paths can't have the same converter twice
        while (paths.length > 0) {
            // For every path, find all the paths that can be made by adding 1 more converter
            const promises = paths.map(async (path) => this.takeStep(path));
            paths = (await Promise.all(promises)).flat();
            const newBest = this.findBest(inType, outPreferences, paths);
            if (newBest && (!bestPath || newBest.weight > bestPath.weight)) {
                bestPath = newBest;
            }
            paths = this.removeBadPaths(paths, maxWeight, inType, bestPath);
        }
        if (!bestPath) {
            this.logger.warn(`No conversion path could be made from ${inType} to ${Object.keys(outPreferences)}.`);
            throw new NotImplementedHttpError_1.NotImplementedHttpError(`No conversion path could be made from ${inType} to ${Object.keys(outPreferences)}.`);
        }
        return bestPath;
    }
    /**
     * Finds the path from the given list that can convert the given type to the given preferences.
     * If there are multiple matches the one with the highest result weight gets chosen.
     * Will return undefined if there are no matches.
     */
    findBest(type, preferences, paths) {
        var _a;
        // Need to use null instead of undefined so `reduce` doesn't take the first element of the array as `best`
        return (_a = paths.reduce((best, path) => {
            const outMatch = ConversionUtil_1.getBestPreference(path.outTypes, preferences);
            if (outMatch && !(best && best.weight >= outMatch.weight)) {
                // Create new MatchedPath, using the output match above
                const inWeight = ConversionUtil_1.getTypeWeight(type, path.inTypes);
                return { path, inType: type, outType: outMatch.value, weight: inWeight * outMatch.weight };
            }
            return best;
        }, null)) !== null && _a !== void 0 ? _a : undefined;
    }
    /**
     * Filter out paths that can no longer be better than the current best solution.
     * This depends on a valid path already being found, if not all the input paths will be returned.
     *
     * @param paths - Paths to filter.
     * @param maxWeight - The maximum weight in the output preferences.
     * @param inType - The input type.
     * @param bestMatch - The current best path.
     */
    removeBadPaths(paths, maxWeight, inType, bestMatch) {
        // All paths are still good if there is no best match yet
        if (!bestMatch) {
            return paths;
        }
        // Do not improve if the maximum weight has been achieved (accounting for floating point errors)
        if (bestMatch.weight >= maxWeight - 0.01) {
            return [];
        }
        // Only return paths that can potentially improve upon bestPath
        return paths.filter((path) => {
            const optimisticWeight = ConversionUtil_1.getTypeWeight(inType, path.inTypes) *
                Math.max(...Object.values(path.outTypes)) *
                maxWeight;
            return optimisticWeight > bestMatch.weight;
        });
    }
    /**
     * Finds all converters that could take the output of the given path as input.
     * For each of these converters a new path gets created which is the input path appended by the converter.
     */
    async takeStep(path) {
        const unusedConverters = this.converters.filter((converter) => !path.converters.includes(converter));
        const nextConverters = await this.supportedConverters(path.outTypes, unusedConverters);
        // Create a new path for every converter that can be appended
        return Promise.all(nextConverters.map(async (pref) => ({
            converters: [...path.converters, pref.converter],
            intermediateTypes: [...path.intermediateTypes, pref.value],
            inTypes: path.inTypes,
            outTypes: this.modifyTypeWeights(pref.weight, await pref.converter.getOutputTypes()),
        })));
    }
    /**
     * Creates a new ValuePreferences object, which is equal to the input object
     * with all values multiplied by the given weight.
     */
    modifyTypeWeights(weight, types) {
        return Object.fromEntries(Object.entries(types).map(([type, pref]) => [type, weight * pref]));
    }
    /**
     * Finds all converters in the given list that support taking any of the given types as input.
     */
    async supportedConverters(types, converters) {
        const promises = converters.map(async (converter) => {
            const inputTypes = await converter.getInputTypes();
            const match = ConversionUtil_1.getBestPreference(types, inputTypes);
            if (match) {
                return { ...match, converter };
            }
        });
        return (await Promise.all(promises)).filter(Boolean);
    }
}
exports.ChainedConverter = ChainedConverter;
//# sourceMappingURL=ChainedConverter.js.map