import type { NamedNode } from 'rdf-js';
declare type RecordOf<TKey extends any[], TValue> = Record<TKey[number], TValue>;
export declare type Namespace<TKey extends any[], TValue> = {
    namespace: TValue;
} & RecordOf<TKey, TValue>;
/**
 * Creates a function that expands local names from the given base URI,
 * and exports the given local names as properties on the returned object.
 */
export declare function createNamespace<TKey extends string, TValue>(baseUri: string, toValue: (expanded: string) => TValue, ...localNames: TKey[]): Namespace<typeof localNames, TValue>;
/**
 * Creates a function that expands local names from the given base URI into strings,
 * and exports the given local names as properties on the returned object.
 */
export declare function createUriNamespace<T extends string>(baseUri: string, ...localNames: T[]): Namespace<typeof localNames, string>;
/**
 * Creates a function that expands local names from the given base URI into named nodes,
 * and exports the given local names as properties on the returned object.
 */
export declare function createTermNamespace<T extends string>(baseUri: string, ...localNames: T[]): Namespace<typeof localNames, NamedNode>;
/**
 * Creates a function that expands local names from the given base URI into string,
 * and exports the given local names as properties on the returned object.
 * Under the `terms` property, it exposes the expanded local names as named nodes.
 */
export declare function createUriAndTermNamespace<T extends string>(baseUri: string, ...localNames: T[]): Namespace<typeof localNames, string> & {
    terms: Namespace<typeof localNames, NamedNode>;
};
export declare const ACL: {
    namespace: string;
} & RecordOf<("default" | "accessTo" | "agent" | "agentClass" | "agentGroup" | "AuthenticatedAgent" | "Authorization" | "mode" | "Write" | "Read" | "Append" | "Control")[], string> & {
    terms: Namespace<("default" | "accessTo" | "agent" | "agentClass" | "agentGroup" | "AuthenticatedAgent" | "Authorization" | "mode" | "Write" | "Read" | "Append" | "Control")[], NamedNode<string>>;
};
export declare const AUTH: {
    namespace: string;
} & RecordOf<("userMode" | "publicMode")[], string> & {
    terms: Namespace<("userMode" | "publicMode")[], NamedNode<string>>;
};
export declare const DC: {
    namespace: string;
} & RecordOf<("description" | "modified" | "title")[], string> & {
    terms: Namespace<("description" | "modified" | "title")[], NamedNode<string>>;
};
export declare const FOAF: {
    namespace: string;
} & RecordOf<"Agent"[], string> & {
    terms: Namespace<"Agent"[], NamedNode<string>>;
};
export declare const HTTP: {
    namespace: string;
} & RecordOf<"statusCodeNumber"[], string> & {
    terms: Namespace<"statusCodeNumber"[], NamedNode<string>>;
};
export declare const LDP: {
    namespace: string;
} & RecordOf<("contains" | "BasicContainer" | "Container" | "Resource")[], string> & {
    terms: Namespace<("contains" | "BasicContainer" | "Container" | "Resource")[], NamedNode<string>>;
};
export declare const MA: {
    namespace: string;
} & RecordOf<"format"[], string> & {
    terms: Namespace<"format"[], NamedNode<string>>;
};
export declare const OIDC: {
    namespace: string;
} & RecordOf<"redirect_uris"[], string> & {
    terms: Namespace<"redirect_uris"[], NamedNode<string>>;
};
export declare const PIM: {
    namespace: string;
} & RecordOf<"Storage"[], string> & {
    terms: Namespace<"Storage"[], NamedNode<string>>;
};
export declare const POSIX: {
    namespace: string;
} & RecordOf<("mtime" | "size")[], string> & {
    terms: Namespace<("mtime" | "size")[], NamedNode<string>>;
};
export declare const RDF: {
    namespace: string;
} & RecordOf<"type"[], string> & {
    terms: Namespace<"type"[], NamedNode<string>>;
};
export declare const SOLID: {
    namespace: string;
} & RecordOf<("oidcIssuer" | "oidcIssuerRegistrationToken" | "oidcRegistration")[], string> & {
    terms: Namespace<("oidcIssuer" | "oidcIssuerRegistrationToken" | "oidcRegistration")[], NamedNode<string>>;
};
export declare const SOLID_ERROR: {
    namespace: string;
} & RecordOf<"stack"[], string> & {
    terms: Namespace<"stack"[], NamedNode<string>>;
};
export declare const SOLID_HTTP: {
    namespace: string;
} & RecordOf<("location" | "slug")[], string> & {
    terms: Namespace<("location" | "slug")[], NamedNode<string>>;
};
export declare const SOLID_META: {
    namespace: string;
} & RecordOf<("ResponseMetadata" | "template")[], string> & {
    terms: Namespace<("ResponseMetadata" | "template")[], NamedNode<string>>;
};
export declare const VANN: {
    namespace: string;
} & RecordOf<"preferredNamespacePrefix"[], string> & {
    terms: Namespace<"preferredNamespacePrefix"[], NamedNode<string>>;
};
export declare const VCARD: {
    namespace: string;
} & RecordOf<"hasMember"[], string> & {
    terms: Namespace<"hasMember"[], NamedNode<string>>;
};
export declare const XSD: {
    namespace: string;
} & RecordOf<("dateTime" | "integer")[], string> & {
    terms: Namespace<("dateTime" | "integer")[], NamedNode<string>>;
};
export declare const CONTENT_TYPE: string;
export declare const CONTENT_TYPE_TERM: NamedNode<string>;
export declare const PREFERRED_PREFIX: string;
export declare const PREFERRED_PREFIX_TERM: NamedNode<string>;
export {};
