/// <reference types="node" />
import type { ReadStream, WriteStream } from 'tty';
import type { IComponentsManagerBuilderOptions } from 'componentsjs';
import type { App } from './App';
export interface CliParams {
    loggingLevel: string;
    port: number;
    baseUrl?: string;
    rootFilePath?: string;
    sparqlEndpoint?: string;
    showStackTrace?: boolean;
    podConfigJson?: string;
}
export declare class AppRunner {
    private readonly logger;
    /**
     * Starts the server with a given config.
     * This method can be used to start the server from within another JavaScript application.
     * @param loaderProperties - Components.js loader properties.
     * @param configFile - Path to the server config file.
     * @param variableParams - Variables to pass into the config file.
     */
    run(loaderProperties: IComponentsManagerBuilderOptions<App>, configFile: string, variableParams: CliParams): Promise<void>;
    /**
     * Starts the server as a command-line application.
     * Made non-async to lower the risk of unhandled promise rejections.
     * @param args - Command line arguments.
     * @param stderr - Standard error stream.
     */
    runCli({ argv, stderr, }?: {
        argv?: string[];
        stdin?: ReadStream;
        stdout?: WriteStream;
        stderr?: WriteStream;
    }): void;
    /**
     * Creates the main app object to start the server from a given config.
     * @param loaderProperties - Components.js loader properties.
     * @param configFile - Path to a Components.js config file.
     * @param variables - Variables to pass into the config file.
     */
    createApp(loaderProperties: IComponentsManagerBuilderOptions<App>, configFile: string, variables: CliParams | Record<string, any>): Promise<App>;
    /**
     * Translates command-line parameters into Components.js variables.
     */
    protected createVariables(params: CliParams): Record<string, any>;
}
