"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
/**
 * Logs messages on a certain level.
 *
 * @see getLoggerFor on how to instantiate loggers.
 */
class Logger {
    /**
     * Log a message at the 'error' level.
     * @param message - The message to log.
     * @param meta - Optional metadata to include in the log message.
     */
    error(message, meta) {
        return this.log('error', message, meta);
    }
    /**
     * Log a message at the 'warn' level.
     * @param message - The message to log.
     * @param meta - Optional metadata to include in the log message.
     */
    warn(message, meta) {
        return this.log('warn', message, meta);
    }
    /**
     * Log a message at the 'info' level.
     * @param message - The message to log.
     * @param meta - Optional metadata to include in the log message.
     */
    info(message, meta) {
        return this.log('info', message, meta);
    }
    /**
     * Log a message at the 'verbose' level.
     * @param message - The message to log.
     * @param meta - Optional metadata to include in the log message.
     */
    verbose(message, meta) {
        return this.log('verbose', message, meta);
    }
    /**
     * Log a message at the 'debug' level.
     * @param message - The message to log.
     * @param meta - Optional metadata to include in the log message.
     */
    debug(message, meta) {
        return this.log('debug', message, meta);
    }
    /**
     * Log a message at the 'silly' level.
     * @param message - The message to log.
     * @param meta - Optional metadata to include in the log message.
     */
    silly(message, meta) {
        return this.log('silly', message, meta);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map