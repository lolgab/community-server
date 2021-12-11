"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LazyLogger = void 0;
const Logger_1 = require("./Logger");
/**
 * Creates a logger lazily using a reference to {@link LazyLoggerFactory}.
 *
 * An error will be thrown if {@link LazyLogger.log} is invoked
 * before a {@link LoggerFactory} is set in {@link LazyLoggerFactory}.
 */
class LazyLogger extends Logger_1.Logger {
    constructor(lazyLoggerFactory, label) {
        super();
        this.lazyLoggerFactory = lazyLoggerFactory;
        this.label = label;
    }
    log(level, message, meta) {
        if (!this.logger) {
            this.logger = this.lazyLoggerFactory.loggerFactory.createLogger(this.label);
        }
        return this.logger.log(level, message, meta);
    }
}
exports.LazyLogger = LazyLogger;
//# sourceMappingURL=LazyLogger.js.map