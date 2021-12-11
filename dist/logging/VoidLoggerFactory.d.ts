import type { Logger } from './Logger';
import type { LoggerFactory } from './LoggerFactory';
/**
 * A factory that always returns {@link VoidLogger}, which does nothing on log messages.
 */
export declare class VoidLoggerFactory implements LoggerFactory {
    private readonly logger;
    createLogger(label: string): Logger;
}
