"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FetchService_1 = require("./FetchService");
const Fetch_1 = require("../../Core/Fetch");
class RestApiService extends FetchService_1.FetchService {
    get libTypings() {
        return RestApiService.libTypings;
    }
    get name() {
        return RestApiService.serviceName;
    }
    fetch(request) {
        let originalResponse;
        let requestCopy = Fetch_1.FetchExecutor.copyRequestDef(request, RestApiService.defaultHeaders);
        if (requestCopy.body) {
            if (typeof requestCopy.body == 'object') {
                requestCopy.body = JSON.stringify(requestCopy.body);
            }
            else if (typeof requestCopy.body == 'string') {
                requestCopy.body = requestCopy.body;
            }
            else {
                throw 'Body of request is not valid for us with rest api service';
            }
        }
        return super.fetch(requestCopy)
            .then((res) => {
            originalResponse = res;
            return JSON.parse(res.body);
        }).then((json) => {
            return new Fetch_1.FetchResponse(originalResponse.status, originalResponse.headers, json);
        });
    }
}
RestApiService.serviceName = "restApiService";
RestApiService.libTypings = `
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
RestApiService.defaultHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Cache': 'no-cache'
};
exports.RestApiService = RestApiService;
