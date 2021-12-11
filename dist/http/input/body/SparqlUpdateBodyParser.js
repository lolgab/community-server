"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SparqlUpdateBodyParser = void 0;
const sparqlalgebrajs_1 = require("sparqlalgebrajs");
const LogUtil_1 = require("../../../logging/LogUtil");
const ContentTypes_1 = require("../../../util/ContentTypes");
const BadRequestHttpError_1 = require("../../../util/errors/BadRequestHttpError");
const ErrorUtil_1 = require("../../../util/errors/ErrorUtil");
const UnsupportedMediaTypeHttpError_1 = require("../../../util/errors/UnsupportedMediaTypeHttpError");
const StreamUtil_1 = require("../../../util/StreamUtil");
const BodyParser_1 = require("./BodyParser");
/**
 * {@link BodyParser} that supports `application/sparql-update` content.
 * Will convert the incoming update string to algebra in a {@link SparqlUpdatePatch}.
 */
class SparqlUpdateBodyParser extends BodyParser_1.BodyParser {
    constructor() {
        super(...arguments);
        this.logger = LogUtil_1.getLoggerFor(this);
    }
    async canHandle({ metadata }) {
        if (metadata.contentType !== ContentTypes_1.APPLICATION_SPARQL_UPDATE) {
            throw new UnsupportedMediaTypeHttpError_1.UnsupportedMediaTypeHttpError('This parser only supports SPARQL UPDATE data.');
        }
    }
    async handle({ request, metadata }) {
        const sparql = await StreamUtil_1.readableToString(request);
        let algebra;
        try {
            algebra = sparqlalgebrajs_1.translate(sparql, { quads: true, baseIRI: metadata.identifier.value });
        }
        catch (error) {
            this.logger.warn('Could not translate SPARQL query to SPARQL algebra', { error });
            throw new BadRequestHttpError_1.BadRequestHttpError(ErrorUtil_1.createErrorMessage(error), { cause: error });
        }
        // Prevent body from being requested again
        return {
            algebra,
            binary: true,
            data: StreamUtil_1.guardedStreamFrom(sparql),
            metadata,
            isEmpty: false,
        };
    }
}
exports.SparqlUpdateBodyParser = SparqlUpdateBodyParser;
//# sourceMappingURL=SparqlUpdateBodyParser.js.map