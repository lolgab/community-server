import { ResponseDescription } from './ResponseDescription';
/**
 * Corresponds to a 301/302 response, containing the relevant location metadata.
 */
export declare class RedirectResponseDescription extends ResponseDescription {
    constructor(location: string, permanently?: boolean);
}
