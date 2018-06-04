import { Machine } from 'script-engine';

declare const require;

let fetchFunction;
if (typeof fetch === 'undefined' && typeof require === 'function') {
    const nodeFetchPackageName = 'node-fetch';
    fetchFunction = eval('require(nodeFetchPackageName)');
} else {
    fetchFunction = window.fetch;
}


let btoaFunction;
if (typeof btoa === 'undefined' && typeof require === 'function') {
    const nodeBtoaPackage = 'btoa';
    btoaFunction = eval('require(nodeBtoaPackage)');
} else {
    btoaFunction = window.btoa;
}

let atobFunction;
if (typeof atob === 'undefined' && typeof require === 'function') {
    const nodeAtobPackage = 'atob';
    atobFunction = eval('require(nodeAtobPackage)');
} else {
    atobFunction = window.atob;
}

/**
 *
 * Promise wrapper for handling promise rejections to our safe machine!
 *
 */
export class PromiseChainScope {
    public chain: ('then'|'catch')[];
    protected _machine: Machine;

    constructor(machine: Machine = null) {
        this.chain = [];
        this._machine = machine;
    }

    public setTo(type: 'then'|'catch'): boolean {
        while (this.chain[0] !== type && this.chain.shift());
        return this.chain.length > 0;
    }

    public callError(e: Error) {
        if (!this._machine) {
            throw e;
        }

        this._machine.call(() => {
            throw e;
        });
    }
}

export class PromiseWraper<T> {
    private _promise: Promise<T>;
    private _chainScope: PromiseChainScope;

    constructor(promise: Promise<T>, chainScope: PromiseChainScope = null) {
        this._promise = promise;
        this._chainScope = chainScope;

        if (!this._chainScope) {
            this._chainScope = new PromiseChainScope();
        }
    }

    public then<PromiseResult>(fnc: (value: T) => PromiseResult): PromiseWraper<PromiseResult> {
        //  push to chain scope;
        this._chainScope.chain.push('then');

        return new PromiseWraper(this._promise.then( (value: T): PromiseResult => {
            //  shift from chain scope
            this._chainScope.setTo('then');
            this._chainScope.chain.shift();

            try {
                return fnc(value);
            } catch (e) {
                //  go to next catch in chain, if exists and then throw error
                if (this._chainScope.setTo('catch')) {
                    throw e;
                } else {
                    //  If no next catch exists, throw error to our safe scope
                    this._chainScope.callError(e);
                }
            }
        }), this._chainScope);
    }

    public catch<PromiseResult>(fnc: (e: Error) => PromiseResult): PromiseWraper<T | PromiseResult> {
        //  push to chain scope;
        this._chainScope.chain.push('catch');

        return new PromiseWraper(this._promise.catch( (e: Error): PromiseResult => {
            //  pop from chain scope
            this._chainScope.setTo('catch');
            this._chainScope.chain.shift();

            try {
                return fnc(e);
            } catch (e) {
                //  go to next catch in chain, if exists and then throw error
                if (this._chainScope.setTo('catch')) {
                    throw e;
                } else {
                    //  If no next catch exists, throw error to our safe scope
                    this._chainScope.callError(e);
                }
            }
        }), this._chainScope);
    }
}


/**
 *
 * Constants
 *
 */
export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD';

export enum ResponseStatus {
    CONTINUE = 100,
    SWITCHING = 101,
    PROCESSING = 102,
    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,
    NON_AUTHORITATIVE = 203,
    NO_CONTENT = 204,
    RESET_CONTENT = 205,
    PARTIAL_CONTENT = 206,
    MULTI_STATUS = 207,
    MULTIPLE_CHOISES = 300,
    MOVED_PERMANENTLY = 301,
    FOUND = 302,
    SEE_OTHER = 303,
    NOT_MODIFIED = 304,
    USE_PROXY = 305,
    SWITCH_PROXY = 306,
    TEMPORARY_REDIRECT = 307,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    PAYMENT_REQUIRED = 402,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    NOT_ACCEPTABLE = 406,
    AUTHENTICATION_REQUIRED = 407,
    REQUEST_TIMEOUT = 408,
    CONFLICT = 409,
    GONE = 410,
    LENGTH_REQUIRED = 411,
    PRECONDITION_FAILED = 412,
    ENTITY_TOO_LARGE = 413,
    URI_TOO_LONG = 414,
    UNSOPPORTED_MEDIA_TYPE = 415,
    REQUEST_RANGE_NOT_SATISFIABLE = 416,
    EXPECTATION_FAILED = 417,
    IAM_TEAPOD = 418,
    UNPROCESSABLE_ENTITY = 422,
    LOCKED = 423,
    FAILED_DEPENDENCY = 424,
    UNORDERED_COLLECTION = 425,
    UPGRADE_REQUIRED = 426,
    RETRY_WITH = 449,
    BLOCKED_BY_WINDOWS_PARENTAL_CONTROLS = 450,
    UNAVAILABLE_FOR_LEGAL_REASON = 451,
    CLIENT_CLOSED_REQUEST = 499,
    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503,
    GATEWAY_TIMEOUT = 504,
    HTTP_VERSION_NOT_SUPPORTED = 505,
    VARIANT_ALSO_NEGOTIATES = 506,
    INSUFFIACIENT_STORAGE = 507,
    BANDWIDTH_LIMIT_EXCEEDED = 509,
    NOT_EXTENDED = 510
}

/**
 *
 * Definition of protocol for communication between this service and proxy
 *
 */
export const RequestDefKeys = ['url', 'method', 'headers', 'body', 'timeout', 'max_redirects', 'reject_unauthorized', 'follow_redirect', 'auth_user', 'auth_pass'];
export interface RequestDef {
    url: string;
    method: string;
    headers: {[key: string]: string};
    body?: any;
    timeout?: number;
    max_redirects?: number;
    reject_unauthorized?: boolean;
    follow_redirect?: boolean;
    auth_user?: string;
    auth_pass?: string;
};

export interface ResponseDef {
    status_code: number;
    headers: {[key: string]: string};
    body: any;
    error_type?: string;
    error_code?: string;
    error_message?: string;
};

/**
 *
 * Error in communication with proxy
 *
 */
export class ProxyCommunicationError extends Error {
    message: string;
    type: string;

    constructor(type: string, message: string) {
        super(message);
        this.name = 'ProxyCommunicationError';
        this.message = message;
        this.type = type;

        (<any>this).__proto__ = ProxyCommunicationError.prototype;
    }
}

/**
 *
 * Error in communication with target server
 *
 */
export class FetchError extends Error {
    message: string;
    code: string;

    constructor(code: string, message: string) {
        super(message);
        this.name = 'FetchError';
        this.message = message;
        this.code = code;

        (<any>this).__proto__ = ProxyCommunicationError.prototype;
    }
}

/**
 *
 * Static helper for executing fetch request to our proxy server
 *
 */
export class FetchExecutor {
    /**
     *
     * Utilities
     *
     */
    public static b64EncodeUnicode(str: string) {
        return btoaFunction(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
            return String.fromCharCode(<any>('0x' + p1));
        }));
    }

    public static b64DecodeUnicode(str) {
        return decodeURIComponent(atobFunction(str).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    }

    public static copyRequestDef(input: RequestDef, defaultHeaders?: {[key: string]: string}): RequestDef {
        let def: RequestDef = <any>{};
        for (let i = 0; i < RequestDefKeys.length; i++) {
            if (input[RequestDefKeys[i]]) {
                def[RequestDefKeys[i]] = input[RequestDefKeys[i]];
            }
        }

        //  prepare headers
        if (!def.headers) {
            if (defaultHeaders) {
                def.headers = defaultHeaders;
            } else {
                def.headers = {};
            }
        }
        return def;
    }

    public static headersToLower(headers: {[key: string]: string}): {[key: string]: string} {
        let headersCopy = {};
        for (let i in headers) {
            if (headers.hasOwnProperty(i)) {
                headersCopy[i.toLowerCase()] = headers[i];
            }
        }
        return headersCopy;
    }

    /**
     *
     * Fetch request, that will be sended to proxy server
     *
     * It will be parsed from json and base64 and you will get promise, that looks like normal fetch from browser,
     * but its not!. You will get object FetchResponse, that is not same as standart response object.
     *
     */
    static fetch(machine: Machine, params: RequestDef, additionalParams?: {[key: string]: string}, proxyUrl?: string): PromiseWraper<FetchResponse> {
        let paramsCopy = FetchExecutor.copyRequestDef(params);

        //  prepare headers
        if (paramsCopy.headers) {
            paramsCopy.headers = FetchExecutor.headersToLower(paramsCopy.headers);
        }

        //  prepare user request payload
        if (params.body && typeof params.body === 'object') {
            paramsCopy.body = JSON.stringify(params.body);
        }

        // prepare payload as base64
        if (paramsCopy.body) {
            paramsCopy.body = FetchExecutor.b64EncodeUnicode(paramsCopy.body);
        }

        if (additionalParams) {
            for (let i in additionalParams) {
                if (additionalParams.hasOwnProperty(i)) {
                    paramsCopy[i] = additionalParams[i];
                }
            }
        }

        // paramsCopy['auth_token'] = ''; // TODO auth token from controller

        //  prepare fetch configuration
        let fetchParams = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cache': 'no-cache'
            },
            body: JSON.stringify(paramsCopy)
        };

        //  status of request
        let status: number = null;

        const proxyServerUrl = proxyUrl ? proxyUrl : FetchRequest.PROXY_SERVER_URL;

        //  do it!, post our request to proxy
        const ret = fetchFunction(proxyServerUrl, fetchParams).then((response: Response) => {
            status = response.status;
            return <ResponseDef><any>response.json();
        }).then((response: ResponseDef)  => {

            //  request to proxy failed
            if (response.error_type && response.error_message) {
                throw new ProxyCommunicationError(response.error_type, response.error_message);
            }

            //  checking status between proxy and service
            if (status === ResponseStatus.OK) {
                return response;
            } else {
                throw new ProxyCommunicationError('unknown', 'Internal request failed (status: ' + status + ')');
            }

        }).then((response: ResponseDef) => {

            //  request from proxy to external server failed
            if (response.error_type && response.error_message) {
                throw new FetchError(response.error_code, response.error_message);
            }

            //  is there body in response?
            let body = null;
            if (response.body) {
                body = FetchExecutor.b64DecodeUnicode(response.body);
            }

            //  is there headers in response?
            let headers = null;
            if (response.headers) {
                headers = FetchExecutor.headersToLower(response.headers);
            }

            return new FetchResponse(response.status_code, headers, body);
        });

        return new PromiseWraper<FetchResponse>(ret, new PromiseChainScope(machine));
    }
}

/**
 *
 * Request object - holder of neccessary informations
 *
 */
export class FetchRequest implements RequestDef {

    public url: string;
    public method: string;
    public headers: {[key: string]: string};
    public body?: any;
    public timeout?: number;
    public max_redirects?: number;
    public reject_unauthorized?: boolean;
    public follow_redirect?: boolean;
    public auth_user?: string;
    public auth_pass?: string;

    /**
     *
     * Our byzance proxy url
     *
     */
    static PROXY_SERVER_URL = 'http://127.0.0.1:4000/fetch/'; // 'http://192.168.65.30:3000/fetch/';//'https://someproxyshit.biz/fetch-proxy';

    public constructor(method: RequestMethod, url: string, body: any = null) {
        this.method = method;
        this.url = url;
        this.body = body;
    }
}

/**
 *
 * Response object
 *
 */
export class FetchResponse {
    private _status: number;
    private _headers: {[key: string]: string};
    private _body: any;

    constructor(status: number, headers: {[key: string]: string}, body: any) {
        this._status = status;
        this._headers = headers;
        this._body = body;
    }

    public get status(): number {
        return this._status;
    }

    public get headers(): {[key: string]: string} {
        return this._headers;
    }

    public get body(): any {
        return this._body;
    }
}

/**
 *
 * Requests with defined methods
 *
 */
export class GetRequest extends FetchRequest {
    public constructor(url: string) {
        super('GET', url);
    }
}

export class PostRequest extends FetchRequest {
    public constructor(url: string, body: any = null) {
        super('POST', url, body);
    }
}

export class PutRequest extends FetchRequest {
    public constructor(url: string, body: any = null) {
        super('PUT', url, body);
    }
}

export class DeleteRequest extends FetchRequest {
    public constructor(url: string) {
        super('DELETE', url);
    }
}

export class HeadRequest extends FetchRequest {
    public constructor(url: string) {
        super('HEAD', url);
    }
}

export class OptionsRequest extends FetchRequest {
    public constructor(url: string) {
        super('OPTIONS', url);
    }
}
