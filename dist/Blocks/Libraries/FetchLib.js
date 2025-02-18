"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Fetch_1 = require("../../Core/Fetch");
class FetchLib {
    constructor() {
    }
    get name() {
        return FetchLib.libName;
    }
    init() { }
    clean() { }
    external(machine) {
        return {
            'ResponseStatus': Fetch_1.ResponseStatus,
            'FetchResponse': Fetch_1.FetchResponse,
            'FetchRequest': Fetch_1.FetchRequest,
            'GetRequest': Fetch_1.GetRequest,
            'PostRequest': Fetch_1.PostRequest,
            'PutRequest': Fetch_1.PutRequest,
            'DeleteRequest': Fetch_1.DeleteRequest,
            'HeadRequest': Fetch_1.HeadRequest,
            'OptionsRequest': Fetch_1.OptionsRequest,
            'ProxyCommunicationError': Fetch_1.ProxyCommunicationError,
            'FetchError': Fetch_1.FetchError
        };
    }
}
FetchLib.libName = 'FetchLib';
FetchLib.libTypings = `
        declare type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD';
        declare enum ResponseStatus {
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
            MULTIPLE_CHOICES = 300,
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
            UNSUPPORTED_MEDIA_TYPE = 415,
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
            INSUFFICIENT_STORAGE = 507,
            BANDWIDTH_LIMIT_EXCEEDED = 509,
            NOT_EXTENDED = 510
        }

        declare interface RequestDef {
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
        }

        declare interface ResponseDef {
            status_code: number;
            headers: {[key: string]: string};
            body: any;
            error_type?: string;
            error_code?: string;
            error_message?: string;
        }

        declare class ProxyCommunicationError extends Error {
            message:string;
            type: string;
        }

        declare class FetchError extends Error {
            message:string;
            code: string;
        }

        declare class FetchRequest implements RequestDef {
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

            constructor(method: RequestMethod, url: string, body: any = null);
        }

        declare class FetchResponse {
            constructor(status: number, headers: {[key: string]: string}, body: any);
            readonly status: number;
            readonly headers: {[key: string]: string};
            readonly body: any;
        }

        declare class GetRequest extends FetchRequest {
            constructor(url: string);
        }

        declare class PostRequest extends FetchRequest {
            constructor(url: string, body: any = null);
        }

        declare class PutRequest extends FetchRequest {
            constructor(url: string, body: any = null);
        }

        declare class DeleteRequest extends FetchRequest {
            constructor(url: string);
        }

        declare class HeadRequest extends FetchRequest {
            constructor(url: string);
        }

        declare class OptionsRequest extends FetchRequest {
            constructor(url: string);
        }
    `;
exports.FetchLib = FetchLib;
