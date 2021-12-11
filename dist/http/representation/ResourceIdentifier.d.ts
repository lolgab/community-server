/**
 * The unique identifier of a resource.
 */
export interface ResourceIdentifier {
    /**
     * Path to the relevant resource.
     */
    path: string;
}
/**
 * Determines whether the object is a `ResourceIdentifier`.
 */
export declare function isResourceIdentifier(object: any): object is ResourceIdentifier;
/**
 * Factory function creating a resource identifier for convenience
 */
export declare function createResourceIdentifier(resourcePath: string): ResourceIdentifier;
