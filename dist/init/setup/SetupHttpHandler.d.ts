import type { ErrorHandler } from '../../http/output/error/ErrorHandler';
import { ResponseDescription } from '../../http/output/response/ResponseDescription';
import type { RegistrationManager } from '../../identity/interaction/email-password/util/RegistrationManager';
import type { OperationHttpHandlerInput } from '../../server/OperationHttpHandler';
import { OperationHttpHandler } from '../../server/OperationHttpHandler';
import type { RepresentationConverter } from '../../storage/conversion/RepresentationConverter';
import type { KeyValueStorage } from '../../storage/keyvalue/KeyValueStorage';
import type { Initializer } from '../Initializer';
/**
 * Input parameters expected in calls to the handler.
 * Will be sent to the RegistrationManager for validation and registration.
 * The reason this is a flat object and does not have a specific field for all the registration parameters
 * is so we can also support form data.
 */
export interface SetupInput extends Record<string, any> {
    /**
     * Indicates if the initializer should be executed. Ignored if `registration` is true.
     */
    initialize?: boolean;
    /**
     * Indicates if the registration procedure should be done for IDP registration and/or pod provisioning.
     */
    registration?: boolean;
}
export interface SetupHttpHandlerArgs {
    /**
     * Used for registering a pod during setup.
     */
    registrationManager?: RegistrationManager;
    /**
     * Initializer to call in case no registration procedure needs to happen.
     * This Initializer should make sure the necessary resources are there so the server can work correctly.
     */
    initializer?: Initializer;
    /**
     * Used for content negotiation.
     */
    converter: RepresentationConverter;
    /**
     * Key that is used to store the boolean in the storage indicating setup is finished.
     */
    storageKey: string;
    /**
     * Used to store setup status.
     */
    storage: KeyValueStorage<string, boolean>;
    /**
     * Template to use for GET requests.
     */
    viewTemplate: string;
    /**
     * Template to show when setup was completed successfully.
     */
    responseTemplate: string;
    /**
     * Used for converting output errors.
     */
    errorHandler: ErrorHandler;
}
/**
 * Handles the initial setup of a server.
 * Will capture all requests until setup is finished,
 * this to prevent accidentally running unsafe servers.
 *
 * GET requests will return the view template which should contain the setup information for the user.
 * POST requests will run an initializer and/or perform a registration step, both optional.
 * After successfully completing a POST request this handler will disable itself and become unreachable.
 * All other methods will be rejected.
 */
export declare class SetupHttpHandler extends OperationHttpHandler {
    protected readonly logger: import("../..").Logger;
    private readonly registrationManager?;
    private readonly initializer?;
    private readonly converter;
    private readonly storageKey;
    private readonly storage;
    private readonly viewTemplate;
    private readonly responseTemplate;
    private readonly errorHandler;
    private finished;
    constructor(args: SetupHttpHandlerArgs);
    handle({ operation }: OperationHttpHandlerInput): Promise<ResponseDescription>;
    /**
     * Creates a JSON object representing the result of executing the given operation,
     * together with the template it should be applied to.
     */
    private getJsonResult;
}
