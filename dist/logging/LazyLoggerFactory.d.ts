import type { Logger } from './Logger';
import type { LoggerFactory } from './LoggerFactory';
/**
 * Wraps over another {@link LoggerFactory} that can be set lazily.
 * This is a singleton class, for which the instance can be retrieved using {@link LazyLoggerFactory.getInstance}.
 *
 * Loggers can safely be created before a {@link LoggerFactory} is set.
 * But an error will be thrown if {@link Logger.log} is invoked before a {@link LoggerFactory} is set.
 *
 * This creates instances of {@link LazyLogger}.
 */
export declare class LazyLoggerFactory implements LoggerFactory {
    private static readonly instance;
    private ploggerFactory;
    private constructor();
    static getInstance(): LazyLoggerFactory;
    createLogger(label: string): Logger;
    resetLoggerFactory(): void;
    get loggerFactory(): LoggerFactory;
    set loggerFactory(loggerFactory: LoggerFactory);
}
