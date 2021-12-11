import type { AuthorizerInput } from './Authorizer';
import { Authorizer } from './Authorizer';
/**
 * Authorizer that bases its decision on the output it gets from its PermissionReader.
 * For each permission it checks if the reader allows that for at least one credential type,
 * if yes authorization is granted.
 * `undefined` values for reader results are interpreted as `false`.
 */
export declare class PermissionBasedAuthorizer extends Authorizer {
    protected readonly logger: import("..").Logger;
    handle(input: AuthorizerInput): Promise<void>;
    /**
     * Ensures that at least one of the credentials provides permissions for the given mode.
     * Throws a {@link ForbiddenHttpError} or {@link UnauthorizedHttpError} depending on the credentials
     * if access is not allowed.
     * @param credentials - Credentials that require access.
     * @param permissionSet - PermissionSet describing the available permissions of the credentials.
     * @param mode - Which mode is requested.
     */
    private requireModePermission;
    /**
     * Checks if one of the Permissions in the PermissionSet grants permission to use the given mode.
     */
    private hasModePermission;
    /**
     * Checks whether the agent is authenticated (logged in) or not (public/anonymous).
     * @param credentials - Credentials to check.
     */
    private isAuthenticated;
}
