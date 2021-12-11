"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LazyLoggerFactory = void 0;
const LazyLogger_1 = require("./LazyLogger");
/**
 * Wraps over another {@link LoggerFactory} that can be set lazily.
 * This is a singleton class, for which the instance can be retrieved using {@link LazyLoggerFactory.getInstance}.
 *
 * Loggers can safely be created before a {@link LoggerFactory} is set.
 * But an error will be thrown if {@link Logger.log} is invoked before a {@link LoggerFactory} is set.
 *
 * This creates instances of {@link LazyLogger}.
 */
class LazyLoggerFactory {
    constructor() {
        // Singleton instance
    }
    static getInstance() {
        return LazyLoggerFactory.instance;
    }
    createLogger(label) {
        return new LazyLogger_1.LazyLogger(this, label);
    }
    resetLoggerFactory() {
        this.ploggerFactory = undefined;
    }
    get loggerFactory() {
        if (!this.ploggerFactory) {
            throw new Error('No logger factory has been set. Can be caused by logger invocation during initialization.');
        }
        return this.ploggerFactory;
    }
    set loggerFactory(loggerFactory) {
        this.ploggerFactory = loggerFactory;
    }
}
exports.LazyLoggerFactory = LazyLoggerFactory;
LazyLoggerFactory.instance = new LazyLoggerFactory();
//# sourceMappingURL=LazyLoggerFactory.js.map