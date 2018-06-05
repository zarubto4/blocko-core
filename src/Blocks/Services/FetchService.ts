import { Service } from './Service';
import { FetchResponse, RequestDef, FetchExecutor, PromiseWraper } from '../../Core/Fetch';

/**
 *
 * Base fetch service
 *
 */
export class FetchService extends Service {
    public static serviceName: string = 'fetchService';
    public static libTypings: string = `
    declare class FetchService {
        /**
         * Fetch request
         */
        fetch(request: RequestDef): Promise<FetchResponse>;
    }

    declare module services {
        const fetchService: FetchService;
    };
    `;

    public constructor(configuration: {fetchParameters: {[key: string]: string}, proxyServerUrl: string} = <any>{}) {
        super(configuration);
    }

    public get libTypings(): string {
        return FetchService.libTypings;
    }

    public get name(): string {
        return FetchService.serviceName
    }

    public fetch(request: RequestDef): PromiseWraper<FetchResponse> {
        // add url and token from configuration
        return FetchExecutor.fetch(this['_machine_'], request, this.configuration['fetchParameters'], this.configuration['proxyServerUrl']);
    }
}
