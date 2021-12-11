import type { LogLevel } from './LogLevel';
/**
 * Logs messages on a certain level.
 *
 * @see getLoggerFor on how to instantiate loggers.
 */
export declare abstract class Logger {
    /**
     * Log the given message at the given level.
     * If the internal level is higher than the given level, the message may be voided.
     * @param level - The level to log at.
     * @param message - The message to log.
     * @param meta - Optional metadata to include in the log message.
     */
    abstract log(level: LogLevel, message: string, meta?: any): Logger;
    /**
     * Log a message at the 'error' level.
     * @param message - The message to log.
     * @param meta - Optional metadata to include in the log message.
     */
    error(message: string, meta?: any): Logger;
    /**
     * Log a message at the 'warn' level.
     * @param message - The message to log.
     * @param meta - Optional metadata to include in the log message.
     */
    warn(message: string, meta?: any): Logger;
    /**
     * Log a message at the 'info' level.
     * @param message - The message to log.
     * @param meta - Optional metadata to include in the log message.
     */
    info(message: string, meta?: any): Logger;
    /**
     * Log a message at the 'verbose' level.
     * @param message - The message to log.
     * @param meta - Optional metadata to include in the log message.
     */
    verbose(message: string, meta?: any): Logger;
    /**
     * Log a message at the 'debug' level.
     * @param message - The message to log.
     * @param meta - Optional metadata to include in the log message.
     */
    debug(message: string, meta?: any): Logger;
    /**
     * Log a message at the 'silly' level.
     * @param message - The message to log.
     * @param meta - Optional metadata to include in the log message.
     */
    silly(message: string, meta?: any): Logger;
}
