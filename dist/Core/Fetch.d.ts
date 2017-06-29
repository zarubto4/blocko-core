import { Machine } from 'script-engine';
export declare class PromiseChainScope {
    chain: ('then' | 'catch')[];
    protected _machine: Machine;
    constructor(machine?: Machine);
    setTo(type: 'then' | 'catch'): boolean;
    callError(e: Error): void;
}
export declare class PromiseWraper<T> {
    private _promise;
    private _chainScope;
    constructor(promise: Promise<T>, chainScope?: PromiseChainScope);
    then<PromiseResult>(fnc: (value: T) => PromiseResult): PromiseWraper<PromiseResult>;
    catch<PromiseResult>(fnc: (e: Error) => PromiseResult): PromiseWraper<T | PromiseResult>;
}
export declare type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD';
export declare enum ResponseStatus {
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
    NOT_EXTENDED = 510,
}
export declare const RequestDefKeys: string[];
export interface RequestDef {
    url: string;
    method: string;
    headers: {
        [key: string]: string;
    };
    body?: any;
    timeout?: number;
    max_redirects?: number;
    reject_unauthorized?: boolean;
    follow_redirect?: boolean;
    auth_user?: string;
    auth_pass?: string;
}
export interface ResponseDef {
    status_code: number;
    headers: {
        [key: string]: string;
    };
    body: any;
    error_type?: string;
    error_code?: string;
    error_message?: string;
}
export declare class ProxyCommunicationError extends Error {
    message: string;
    type: string;
    constructor(type: string, message: string);
}
export declare class FetchError extends Error {
    message: string;
    code: string;
    constructor(code: string, message: string);
}
export declare class FetchExecutor {
    static b64EncodeUnicode(str: string): any;
    static b64DecodeUnicode(str: any): string;
    static copyRequestDef(input: RequestDef, defaultHeaders?: {
        [key: string]: string;
    }): RequestDef;
    static headersToLower(headers: {
        [key: string]: string;
    }): {
        [key: string]: string;
    };
    static fetch(machine: Machine, params: RequestDef, additionalParams?: {
        [key: string]: string;
    }, proxyUrl?: string): PromiseWraper<FetchResponse>;
}
export declare class FetchRequest implements RequestDef {
    url: string;
    method: string;
    headers: {
        [key: string]: string;
    };
    body?: any;
    timeout?: number;
    max_redirects?: number;
    reject_unauthorized?: boolean;
    follow_redirect?: boolean;
    auth_user?: string;
    auth_pass?: string;
    static PROXY_SERVER_URL: string;
    constructor(method: RequestMethod, url: string, body?: any);
}
export declare class FetchResponse {
    private _status;
    private _headers;
    private _body;
    constructor(status: number, headers: {
        [key: string]: string;
    }, body: any);
    readonly status: number;
    readonly headers: {
        [key: string]: string;
    };
    readonly body: any;
}
export declare class GetRequest extends FetchRequest {
    constructor(url: string);
}
export declare class PostRequest extends FetchRequest {
    constructor(url: string, body?: any);
}
export declare class PutRequest extends FetchRequest {
    constructor(url: string, body?: any);
}
export declare class DeleteRequest extends FetchRequest {
    constructor(url: string);
}
export declare class HeadRequest extends FetchRequest {
    constructor(url: string);
}
export declare class OptionsRequest extends FetchRequest {
    constructor(url: string);
}
