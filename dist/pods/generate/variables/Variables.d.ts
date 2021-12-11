export declare const TEMPLATE: {
    namespace: string;
} & {
    ResourceStore: string;
} & {
    terms: import("../../../util/Vocabularies").Namespace<"ResourceStore"[], import("rdf-js").NamedNode<string>>;
};
export declare const TEMPLATE_VARIABLE: {
    namespace: string;
} & {
    baseUrl: string;
    rootFilePath: string;
    sparqlEndpoint: string;
    templateConfig: string;
} & {
    terms: import("../../../util/Vocabularies").Namespace<("baseUrl" | "rootFilePath" | "sparqlEndpoint" | "templateConfig")[], import("rdf-js").NamedNode<string>>;
};
/**
 * Checks if the given variable is one that is supported.
 * This can be used to weed out irrelevant parameters in an object.
 */
export declare function isValidVariable(variable: string): boolean;
