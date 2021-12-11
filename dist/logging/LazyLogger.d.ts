import type { LazyLoggerFactory } from './LazyLoggerFactory';
import { Logger } from './Logger';
import type { LogLevel } from './LogLevel';
/**
 * Creates a logger lazily using a reference to {@link LazyLoggerFactory}.
 *
 * An error will be thrown if {@link LazyLogger.log} is invoked
 * before a {@link LoggerFactory} is set in {@link LazyLoggerFactory}.
 */
export declare class LazyLogger extends Logger {
    private readonly lazyLoggerFactory;
    private readonly label;
    private logger;
    constructor(lazyLoggerFactory: LazyLoggerFactory, label: string);
    log(level: LogLevel, message: string, meta: any): Logger;
}
