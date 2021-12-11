import type { Adapter, AdapterPayload } from 'oidc-provider';
import type { RepresentationConverter } from '../../storage/conversion/RepresentationConverter';
import type { AdapterFactory } from './AdapterFactory';
/**
 * This {@link Adapter} redirects the `find` call to its source adapter.
 * In case no client data was found in the source for the given WebId,
 * this class will do an HTTP GET request to that WebId.
 * If a valid `solid:oidcRegistration` triple is found there,
 * that data will be returned instead.
 */
export declare class WebIdAdapter implements Adapter {
    protected readonly logger: import("../..").Logger;
    private readonly name;
    private readonly source;
    private readonly converter;
    constructor(name: string, source: Adapter, converter: RepresentationConverter);
    upsert(id: string, payload: AdapterPayload, expiresIn: number): Promise<void>;
    find(id: string): Promise<AdapterPayload | void>;
    /**
     * Parses RDF data found at a client WebID.
     * @param data - Raw data from the WebID.
     * @param id - The actual WebID.
     * @param response - Response object from the request.
     */
    private parseRdfWebId;
    findByUserCode(userCode: string): Promise<AdapterPayload | void>;
    findByUid(uid: string): Promise<AdapterPayload | void>;
    destroy(id: string): Promise<void>;
    revokeByGrantId(grantId: string): Promise<void>;
    consume(id: string): Promise<void>;
}
export declare class WebIdAdapterFactory implements AdapterFactory {
    private readonly source;
    private readonly converter;
    constructor(source: AdapterFactory, converter: RepresentationConverter);
    createStorageAdapter(name: string): Adapter;
}
