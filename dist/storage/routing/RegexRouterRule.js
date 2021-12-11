"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegexRouterRule = void 0;
const BadRequestHttpError_1 = require("../../util/errors/BadRequestHttpError");
const NotImplementedHttpError_1 = require("../../util/errors/NotImplementedHttpError");
const PathUtil_1 = require("../../util/PathUtil");
const RouterRule_1 = require("./RouterRule");
/**
 * Routes requests to a store based on the path of the identifier.
 * The identifier will be stripped of the base URI after which regexes will be used to find the correct store.
 * The trailing slash of the base URI will still be present so the first character a regex can match would be that `/`.
 * This way regexes such as `/container/` can match containers in any position.
 *
 * In case none of the regexes match an error will be thrown.
 */
class RegexRouterRule extends RouterRule_1.RouterRule {
    /**
     * The keys of the `storeMap` will be converted into actual RegExp objects that will be used for testing.
     */
    constructor(base, storeMap) {
        super();
        this.base = PathUtil_1.trimTrailingSlashes(base);
        this.regexes = new Map(Object.keys(storeMap).map((regex) => [new RegExp(regex, 'u'), storeMap[regex]]));
    }
    async canHandle(input) {
        this.matchStore(input.identifier);
    }
    async handle(input) {
        return this.matchStore(input.identifier);
    }
    /**
     * Finds the store corresponding to the regex that matches the given identifier.
     * Throws an error if none is found.
     */
    matchStore(identifier) {
        const path = this.toRelative(identifier);
        for (const regex of this.regexes.keys()) {
            if (regex.test(path)) {
                return this.regexes.get(regex);
            }
        }
        throw new NotImplementedHttpError_1.NotImplementedHttpError(`No stored regexes match ${identifier.path}`);
    }
    /**
     * Strips the base of the identifier and throws an error if there is no overlap.
     */
    toRelative(identifier) {
        if (!identifier.path.startsWith(this.base)) {
            throw new BadRequestHttpError_1.BadRequestHttpError(`Identifiers need to start with ${this.base}`);
        }
        return identifier.path.slice(this.base.length);
    }
}
exports.RegexRouterRule = RegexRouterRule;
//# sourceMappingURL=RegexRouterRule.js.map