import { Logger } from './Logger';
import type { LogLevel } from './LogLevel';
/**
 * A logger that does nothing on a log message.
 */
export declare class VoidLogger extends Logger {
    log(level: LogLevel, message: string, meta?: any): Logger;
}
