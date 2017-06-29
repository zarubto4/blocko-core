import { FetchService } from './FetchService';
import { FetchResponse, RequestDef, PromiseWraper } from '../../Core/Fetch';
export declare class RestApiService extends FetchService {
    static serviceName: string;
    static libTypings: string;
    readonly libTypings: string;
    static defaultHeaders: {
        'Accept': string;
        'Content-Type': string;
        'Cache': string;
    };
    readonly name: string;
    fetch(request: RequestDef): PromiseWraper<FetchResponse>;
}
