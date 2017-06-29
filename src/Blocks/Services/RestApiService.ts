/**
 * Created by David Uhlíř on 10.04.17.
 */

import { FetchService } from './FetchService';
import { FetchResponse, RequestDef, FetchExecutor, PromiseWraper } from '../../Core/Fetch';

/*
 *
 * Rest api service,
 * 
 * It is provides fetch for requests with json response
 * 
 */
export class RestApiService extends FetchService {
    public static serviceName:string = "restApiService";
    public static libTypings:string = `
    declare class RestApiService {
        /**
         * Fetch request with converting body to json
         */
        fetch(request: RequestDef): Promise<FetchResponse>;
    }

    declare module services {
        const restApiService: RestApiService;
    };
    `;

    public get libTypings(): string {
        return RestApiService.libTypings;
    }

    static defaultHeaders = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cache': 'no-cache'
    };

    public get name(): string {
        return RestApiService.serviceName
    }

    /**
     * 
     * Fetch with converting request body to string from json and back in response string to json
     * 
     */
    public fetch(request: RequestDef): PromiseWraper<FetchResponse> {
        let originalResponse: FetchResponse;
        let requestCopy = FetchExecutor.copyRequestDef(request, RestApiService.defaultHeaders);

        if (requestCopy.body) {
            if (typeof requestCopy.body == 'object') {
                requestCopy.body = JSON.stringify(requestCopy.body);
            } else if (typeof requestCopy.body == 'string') {
                requestCopy.body = requestCopy.body;
            } else {
                throw 'Body of request is not valid for us with rest api service';
            }
        }

        return super.fetch(requestCopy)
            .then((res: FetchResponse) => {
                originalResponse = res;
                return JSON.parse(res.body);
            }).then((json: any) => {
                return new FetchResponse(originalResponse.status, originalResponse.headers, json);
            });
    }
}