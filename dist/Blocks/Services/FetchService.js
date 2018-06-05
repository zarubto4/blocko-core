"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Service_1 = require("./Service");
const Fetch_1 = require("../../Core/Fetch");
class FetchService extends Service_1.Service {
    constructor(configuration = {}) {
        super(configuration);
    }
    get libTypings() {
        return FetchService.libTypings;
    }
    get name() {
        return FetchService.serviceName;
    }
    fetch(request) {
        return Fetch_1.FetchExecutor.fetch(this['_machine_'], request, this.configuration['fetchParameters'], this.configuration['proxyServerUrl']);
    }
}
FetchService.serviceName = 'fetchService';
FetchService.libTypings = `
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
exports.FetchService = FetchService;
