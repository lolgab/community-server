import type { Logger as WinstonInnerLogger } from 'winston';
import { Logger } from './Logger';
import type { LogLevel } from './LogLevel';
/**
 * A WinstonLogger implements the {@link Logger} interface using a given winston logger.
 */
export declare class WinstonLogger extends Logger {
    private readonly logger;
    constructor(logger: WinstonInnerLogger);
    log(level: LogLevel, message: string, meta?: any): this;
}
