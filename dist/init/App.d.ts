import type { Finalizable } from './final/Finalizable';
import type { Initializer } from './Initializer';
/**
 * Entry point for the entire Solid server.
 */
export declare class App {
    private readonly initializer;
    private readonly finalizer;
    constructor(initializer: Initializer, finalizer: Finalizable);
    /**
     * Initializes and starts the application.
     */
    start(): Promise<void>;
    /**
     * Stops the application and handles cleanup.
     */
    stop(): Promise<void>;
}
