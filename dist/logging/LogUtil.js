"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetGlobalLoggerFactory = exports.setGlobalLoggerFactory = exports.getLoggerFor = void 0;
const LazyLoggerFactory_1 = require("./LazyLoggerFactory");
/**
 * Gets a logger instance for the given class instance.
 *
 * The returned type of logger depends on the configured {@link LoggerFactory} in {@link Setup}.
 *
 * The following shows a typical pattern on how to create loggers:
 * ```
 * class MyClass {
 *   protected readonly logger = getLoggerFor(this);
 * }
 * ```
 * If no class is applicable, a logger can also be created as follows:
 * ```
 * const logger = getLoggerFor('MyFunction');
 * ```
 *
 * @param loggable - A class instance or a class string name.
 */
function getLoggerFor(loggable) {
    return LazyLoggerFactory_1.LazyLoggerFactory.getInstance()
        .createLogger(typeof loggable === 'string' ? loggable : loggable.constructor.name);
}
exports.getLoggerFor = getLoggerFor;
/**
 * Sets the global logger factory.
 * This will cause all loggers created by {@link getLoggerFor} to be delegated to a logger from the given factory.
 * @param loggerFactory - A logger factory.
 */
function setGlobalLoggerFactory(loggerFactory) {
    LazyLoggerFactory_1.LazyLoggerFactory.getInstance().loggerFactory = loggerFactory;
}
exports.setGlobalLoggerFactory = setGlobalLoggerFactory;
/**
 * Resets the global logger factory to undefined.
 *
 * This typically only needs to be called during testing.
 * Call this at your own risk.
 */
function resetGlobalLoggerFactory() {
    LazyLoggerFactory_1.LazyLoggerFactory.getInstance().resetLoggerFactory();
}
exports.resetGlobalLoggerFactory = resetGlobalLoggerFactory;
//# sourceMappingURL=LogUtil.js.map