import { Service } from './Service';
import { FetchResponse, RequestDef, PromiseWraper } from '../../Core/Fetch';
export declare class FetchService extends Service {
    static serviceName: string;
    static libTypings: string;
    constructor(configuration?: {
        fetchParameters: {
            [key: string]: string;
        };
        proxyServerUrl: string;
    });
    readonly libTypings: string;
    readonly name: string;
    fetch(request: RequestDef): PromiseWraper<FetchResponse>;
}
