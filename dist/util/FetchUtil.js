"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchDataset = void 0;
const cross_fetch_1 = require("cross-fetch");
const BasicRepresentation_1 = require("../http/representation/BasicRepresentation");
const LogUtil_1 = require("../logging/LogUtil");
const ContentTypes_1 = require("./ContentTypes");
const BadRequestHttpError_1 = require("./errors/BadRequestHttpError");
const HeaderUtil_1 = require("./HeaderUtil");
const logger = LogUtil_1.getLoggerFor('FetchUtil');
async function fetchDataset(input, converter, body) {
    let response;
    if (typeof input === 'string') {
        response = await cross_fetch_1.fetch(input);
    }
    else {
        response = input;
    }
    if (!body) {
        body = await response.text();
    }
    // Keeping the error message the same everywhere to prevent leaking possible information about intranet.
    const error = new BadRequestHttpError_1.BadRequestHttpError(`Unable to access data at ${response.url}`);
    if (response.status !== 200) {
        logger.warn(`Cannot fetch ${response.url}: ${body}`);
        throw error;
    }
    const contentType = response.headers.get('content-type');
    if (!contentType) {
        logger.warn(`Missing content-type header from ${response.url}`);
        throw error;
    }
    const contentTypeValue = HeaderUtil_1.parseContentType(contentType).type;
    // Try to convert to quads
    const representation = new BasicRepresentation_1.BasicRepresentation(body, contentTypeValue);
    const preferences = { type: { [ContentTypes_1.INTERNAL_QUADS]: 1 } };
    return converter.handleSafe({ representation, identifier: { path: response.url }, preferences });
}
exports.fetchDataset = fetchDataset;
//# sourceMappingURL=FetchUtil.js.map