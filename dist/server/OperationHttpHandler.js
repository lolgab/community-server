"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationHttpHandler = void 0;
const AsyncHandler_1 = require("../util/handlers/AsyncHandler");
/**
 * An HTTP handler that makes use of an already parsed Operation.
 * Can either return a ResponseDescription to be resolved by the calling class,
 * or undefined if this class handles the response itself.
 */
class OperationHttpHandler extends AsyncHandler_1.AsyncHandler {
}
exports.OperationHttpHandler = OperationHttpHandler;
//# sourceMappingURL=OperationHttpHandler.js.map