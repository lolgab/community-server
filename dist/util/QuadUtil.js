"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseQuads = exports.serializeQuads = void 0;
const arrayify_stream_1 = __importDefault(require("arrayify-stream"));
const n3_1 = require("n3");
const StreamUtil_1 = require("./StreamUtil");
function serializeQuads(quads, contentType) {
    return StreamUtil_1.pipeSafely(StreamUtil_1.guardedStreamFrom(quads), new n3_1.StreamWriter({ format: contentType }));
}
exports.serializeQuads = serializeQuads;
/**
 * Helper function to convert a Readable into an array of quads.
 * @param readable - The readable object.
 * @param options - Options for the parser.
 *
 * @returns A promise containing the array of quads.
 */
async function parseQuads(readable, options = {}) {
    return arrayify_stream_1.default(StreamUtil_1.pipeSafely(readable, new n3_1.StreamParser(options)));
}
exports.parseQuads = parseQuads;
//# sourceMappingURL=QuadUtil.js.map