import { FetchService } from './FetchService';
import { FetchResponse, RequestDef, PromiseWraper } from '../../Core/Fetch';
export declare class XmlApiService extends FetchService {
    static serviceName: string;
    static libTypings: string;
    readonly libTypings: string;
    static defaultHeaders: {
        'Accept': string;
        'Content-Type': string;
        'Cache': string;
    };
    readonly name: string;
    static decodeXml(xmlStr: any): Object;
    static encodeXml(xml: any): any;
    fetch(request: RequestDef): PromiseWraper<FetchResponse>;
}
