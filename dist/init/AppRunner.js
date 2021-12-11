"use strict";
/* eslint-disable unicorn/no-process-exit */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppRunner = void 0;
const componentsjs_1 = require("componentsjs");
const yargs_1 = __importDefault(require("yargs"));
const LogUtil_1 = require("../logging/LogUtil");
const PathUtil_1 = require("../util/PathUtil");
const defaultConfig = `${PathUtil_1.modulePathPlaceholder}config/default.json`;
class AppRunner {
    constructor() {
        this.logger = LogUtil_1.getLoggerFor(this);
    }
    /**
     * Starts the server with a given config.
     * This method can be used to start the server from within another JavaScript application.
     * @param loaderProperties - Components.js loader properties.
     * @param configFile - Path to the server config file.
     * @param variableParams - Variables to pass into the config file.
     */
    async run(loaderProperties, configFile, variableParams) {
        const app = await this.createApp(loaderProperties, configFile, variableParams);
        await app.start();
    }
    /**
     * Starts the server as a command-line application.
     * Made non-async to lower the risk of unhandled promise rejections.
     * @param args - Command line arguments.
     * @param stderr - Standard error stream.
     */
    runCli({ argv = process.argv, stderr = process.stderr, } = {}) {
        // Parse the command-line arguments
        // eslint-disable-next-line no-sync
        const params = yargs_1.default(argv.slice(2))
            .strict()
            .usage('node ./bin/server.js [args]')
            .check((args) => {
            if (args._.length > 0) {
                throw new Error(`Unsupported positional arguments: "${args._.join('", "')}"`);
            }
            for (const key of Object.keys(args)) {
                // We have no options that allow for arrays
                const val = args[key];
                if (key !== '_' && Array.isArray(val)) {
                    throw new Error(`Multiple values were provided for: "${key}": "${val.join('", "')}"`);
                }
            }
            return true;
        })
            .options({
            baseUrl: { type: 'string', alias: 'b', requiresArg: true },
            config: { type: 'string', alias: 'c', default: defaultConfig, requiresArg: true },
            loggingLevel: { type: 'string', alias: 'l', default: 'info', requiresArg: true },
            mainModulePath: { type: 'string', alias: 'm', requiresArg: true },
            port: { type: 'number', alias: 'p', default: 3000, requiresArg: true },
            rootFilePath: { type: 'string', alias: 'f', default: './', requiresArg: true },
            showStackTrace: { type: 'boolean', alias: 't', default: false },
            sparqlEndpoint: { type: 'string', alias: 's', requiresArg: true },
            podConfigJson: { type: 'string', default: './pod-config.json', requiresArg: true },
        })
            .parseSync();
        // Gather settings for instantiating the server
        const loaderProperties = {
            mainModulePath: PathUtil_1.resolveAssetPath(params.mainModulePath),
            dumpErrorState: true,
            logLevel: params.loggingLevel,
        };
        const configFile = PathUtil_1.resolveAssetPath(params.config);
        // Create and execute the app
        this.createApp(loaderProperties, configFile, params)
            .then(async (app) => app.start(), (error) => {
            // Instantiation of components has failed, so there is no logger to use
            stderr.write(`Error: could not instantiate server from ${configFile}\n`);
            stderr.write(`${error.stack}\n`);
            process.exit(1);
        }).catch((error) => {
            this.logger.error(`Could not start server: ${error}`, { error });
            process.exit(1);
        });
    }
    /**
     * Creates the main app object to start the server from a given config.
     * @param loaderProperties - Components.js loader properties.
     * @param configFile - Path to a Components.js config file.
     * @param variables - Variables to pass into the config file.
     */
    async createApp(loaderProperties, configFile, variables) {
        // Translate command-line parameters if needed
        if (typeof variables.loggingLevel === 'string') {
            variables = this.createVariables(variables);
        }
        // Set up Components.js
        const componentsManager = await componentsjs_1.ComponentsManager.build(loaderProperties);
        await componentsManager.configRegistry.register(configFile);
        // Create the app
        const app = 'urn:solid-server:default:App';
        return await componentsManager.instantiate(app, { variables });
    }
    /**
     * Translates command-line parameters into Components.js variables.
     */
    createVariables(params) {
        return {
            'urn:solid-server:default:variable:baseUrl': params.baseUrl ? PathUtil_1.ensureTrailingSlash(params.baseUrl) : `http://localhost:${params.port}/`,
            'urn:solid-server:default:variable:loggingLevel': params.loggingLevel,
            'urn:solid-server:default:variable:port': params.port,
            'urn:solid-server:default:variable:rootFilePath': PathUtil_1.resolveAssetPath(params.rootFilePath),
            'urn:solid-server:default:variable:sparqlEndpoint': params.sparqlEndpoint,
            'urn:solid-server:default:variable:showStackTrace': params.showStackTrace,
            'urn:solid-server:default:variable:podConfigJson': PathUtil_1.resolveAssetPath(params.podConfigJson),
        };
    }
}
exports.AppRunner = AppRunner;
//# sourceMappingURL=AppRunner.js.map