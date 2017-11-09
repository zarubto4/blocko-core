"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fetchFunction;
if (typeof fetch === 'undefined' && typeof require === "function") {
    const nodeFetchPackageName = 'node-fetch';
    fetchFunction = eval("require(nodeFetchPackageName)");
}
else {
    fetchFunction = window.fetch;
}
var btoaFunction;
if (typeof btoa === 'undefined' && typeof require === "function") {
    const nodeBtoaPackage = 'btoa';
    btoaFunction = eval("require(nodeBtoaPackage)");
}
else {
    btoaFunction = window.btoa;
}
var atobFunction;
if (typeof atob === 'undefined' && typeof require === "function") {
    const nodeAtobPackage = 'atob';
    atobFunction = eval("require(nodeAtobPackage)");
}
else {
    atobFunction = window.atob;
}
class PromiseChainScope {
    constructor(machine = null) {
        this.chain = [];
        this._machine = machine;
    }
    setTo(type) {
        while (this.chain[0] != type && this.chain.shift())
            ;
        return this.chain.length > 0;
    }
    callError(e) {
        if (!this._machine) {
            throw e;
        }
        this._machine.call(() => {
            throw e;
        });
    }
}
exports.PromiseChainScope = PromiseChainScope;
class PromiseWraper {
    constructor(promise, chainScope = null) {
        this._promise = promise;
        this._chainScope = chainScope;
        if (!this._chainScope) {
            this._chainScope = new PromiseChainScope();
        }
    }
    then(fnc) {
        this._chainScope.chain.push('then');
        return new PromiseWraper(this._promise.then((value) => {
            this._chainScope.setTo('then');
            this._chainScope.chain.shift();
            try {
                return fnc(value);
            }
            catch (e) {
                if (this._chainScope.setTo('catch')) {
                    throw e;
                }
                else {
                    this._chainScope.callError(e);
                }
            }
        }), this._chainScope);
    }
    catch(fnc) {
        this._chainScope.chain.push('catch');
        return new PromiseWraper(this._promise.catch((e) => {
            this._chainScope.setTo('catch');
            this._chainScope.chain.shift();
            try {
                return fnc(e);
            }
            catch (e) {
                if (this._chainScope.setTo('catch')) {
                    throw e;
                }
                else {
                    this._chainScope.callError(e);
                }
            }
        }), this._chainScope);
    }
}
exports.PromiseWraper = PromiseWraper;
var ResponseStatus;
(function (ResponseStatus) {
    ResponseStatus[ResponseStatus["CONTINUE"] = 100] = "CONTINUE";
    ResponseStatus[ResponseStatus["SWITCHING"] = 101] = "SWITCHING";
    ResponseStatus[ResponseStatus["PROCESSING"] = 102] = "PROCESSING";
    ResponseStatus[ResponseStatus["OK"] = 200] = "OK";
    ResponseStatus[ResponseStatus["CREATED"] = 201] = "CREATED";
    ResponseStatus[ResponseStatus["ACCEPTED"] = 202] = "ACCEPTED";
    ResponseStatus[ResponseStatus["NON_AUTHORITATIVE"] = 203] = "NON_AUTHORITATIVE";
    ResponseStatus[ResponseStatus["NO_CONTENT"] = 204] = "NO_CONTENT";
    ResponseStatus[ResponseStatus["RESET_CONTENT"] = 205] = "RESET_CONTENT";
    ResponseStatus[ResponseStatus["PARTIAL_CONTENT"] = 206] = "PARTIAL_CONTENT";
    ResponseStatus[ResponseStatus["MULTI_STATUS"] = 207] = "MULTI_STATUS";
    ResponseStatus[ResponseStatus["MULTIPLE_CHOISES"] = 300] = "MULTIPLE_CHOISES";
    ResponseStatus[ResponseStatus["MOVED_PERMANENTLY"] = 301] = "MOVED_PERMANENTLY";
    ResponseStatus[ResponseStatus["FOUND"] = 302] = "FOUND";
    ResponseStatus[ResponseStatus["SEE_OTHER"] = 303] = "SEE_OTHER";
    ResponseStatus[ResponseStatus["NOT_MODIFIED"] = 304] = "NOT_MODIFIED";
    ResponseStatus[ResponseStatus["USE_PROXY"] = 305] = "USE_PROXY";
    ResponseStatus[ResponseStatus["SWITCH_PROXY"] = 306] = "SWITCH_PROXY";
    ResponseStatus[ResponseStatus["TEMPORARY_REDIRECT"] = 307] = "TEMPORARY_REDIRECT";
    ResponseStatus[ResponseStatus["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    ResponseStatus[ResponseStatus["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    ResponseStatus[ResponseStatus["PAYMENT_REQUIRED"] = 402] = "PAYMENT_REQUIRED";
    ResponseStatus[ResponseStatus["FORBIDDEN"] = 403] = "FORBIDDEN";
    ResponseStatus[ResponseStatus["NOT_FOUND"] = 404] = "NOT_FOUND";
    ResponseStatus[ResponseStatus["METHOD_NOT_ALLOWED"] = 405] = "METHOD_NOT_ALLOWED";
    ResponseStatus[ResponseStatus["NOT_ACCEPTABLE"] = 406] = "NOT_ACCEPTABLE";
    ResponseStatus[ResponseStatus["AUTHENTICATION_REQUIRED"] = 407] = "AUTHENTICATION_REQUIRED";
    ResponseStatus[ResponseStatus["REQUEST_TIMEOUT"] = 408] = "REQUEST_TIMEOUT";
    ResponseStatus[ResponseStatus["CONFLICT"] = 409] = "CONFLICT";
    ResponseStatus[ResponseStatus["GONE"] = 410] = "GONE";
    ResponseStatus[ResponseStatus["LENGTH_REQUIRED"] = 411] = "LENGTH_REQUIRED";
    ResponseStatus[ResponseStatus["PRECONDITION_FAILED"] = 412] = "PRECONDITION_FAILED";
    ResponseStatus[ResponseStatus["ENTITY_TOO_LARGE"] = 413] = "ENTITY_TOO_LARGE";
    ResponseStatus[ResponseStatus["URI_TOO_LONG"] = 414] = "URI_TOO_LONG";
    ResponseStatus[ResponseStatus["UNSOPPORTED_MEDIA_TYPE"] = 415] = "UNSOPPORTED_MEDIA_TYPE";
    ResponseStatus[ResponseStatus["REQUEST_RANGE_NOT_SATISFIABLE"] = 416] = "REQUEST_RANGE_NOT_SATISFIABLE";
    ResponseStatus[ResponseStatus["EXPECTATION_FAILED"] = 417] = "EXPECTATION_FAILED";
    ResponseStatus[ResponseStatus["IAM_TEAPOD"] = 418] = "IAM_TEAPOD";
    ResponseStatus[ResponseStatus["UNPROCESSABLE_ENTITY"] = 422] = "UNPROCESSABLE_ENTITY";
    ResponseStatus[ResponseStatus["LOCKED"] = 423] = "LOCKED";
    ResponseStatus[ResponseStatus["FAILED_DEPENDENCY"] = 424] = "FAILED_DEPENDENCY";
    ResponseStatus[ResponseStatus["UNORDERED_COLLECTION"] = 425] = "UNORDERED_COLLECTION";
    ResponseStatus[ResponseStatus["UPGRADE_REQUIRED"] = 426] = "UPGRADE_REQUIRED";
    ResponseStatus[ResponseStatus["RETRY_WITH"] = 449] = "RETRY_WITH";
    ResponseStatus[ResponseStatus["BLOCKED_BY_WINDOWS_PARENTAL_CONTROLS"] = 450] = "BLOCKED_BY_WINDOWS_PARENTAL_CONTROLS";
    ResponseStatus[ResponseStatus["UNAVAILABLE_FOR_LEGAL_REASON"] = 451] = "UNAVAILABLE_FOR_LEGAL_REASON";
    ResponseStatus[ResponseStatus["CLIENT_CLOSED_REQUEST"] = 499] = "CLIENT_CLOSED_REQUEST";
    ResponseStatus[ResponseStatus["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
    ResponseStatus[ResponseStatus["NOT_IMPLEMENTED"] = 501] = "NOT_IMPLEMENTED";
    ResponseStatus[ResponseStatus["BAD_GATEWAY"] = 502] = "BAD_GATEWAY";
    ResponseStatus[ResponseStatus["SERVICE_UNAVAILABLE"] = 503] = "SERVICE_UNAVAILABLE";
    ResponseStatus[ResponseStatus["GATEWAY_TIMEOUT"] = 504] = "GATEWAY_TIMEOUT";
    ResponseStatus[ResponseStatus["HTTP_VERSION_NOT_SUPPORTED"] = 505] = "HTTP_VERSION_NOT_SUPPORTED";
    ResponseStatus[ResponseStatus["VARIANT_ALSO_NEGOTIATES"] = 506] = "VARIANT_ALSO_NEGOTIATES";
    ResponseStatus[ResponseStatus["INSUFFIACIENT_STORAGE"] = 507] = "INSUFFIACIENT_STORAGE";
    ResponseStatus[ResponseStatus["BANDWIDTH_LIMIT_EXCEEDED"] = 509] = "BANDWIDTH_LIMIT_EXCEEDED";
    ResponseStatus[ResponseStatus["NOT_EXTENDED"] = 510] = "NOT_EXTENDED";
})(ResponseStatus = exports.ResponseStatus || (exports.ResponseStatus = {}));
exports.RequestDefKeys = ['url', 'method', 'headers', 'body', 'timeout', 'max_redirects', 'reject_unauthorized', 'follow_redirect', 'auth_user', 'auth_pass'];
;
;
class ProxyCommunicationError extends Error {
    constructor(type, message) {
        super(message);
        this.name = "ProxyCommunicationError";
        this.message = message;
        this.type = type;
        this.__proto__ = ProxyCommunicationError.prototype;
    }
}
exports.ProxyCommunicationError = ProxyCommunicationError;
class FetchError extends Error {
    constructor(code, message) {
        super(message);
        this.name = "FetchError";
        this.message = message;
        this.code = code;
        this.__proto__ = ProxyCommunicationError.prototype;
    }
}
exports.FetchError = FetchError;
class FetchExecutor {
    static b64EncodeUnicode(str) {
        return btoaFunction(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
            return String.fromCharCode(('0x' + p1));
        }));
    }
    static b64DecodeUnicode(str) {
        return decodeURIComponent(atobFunction(str).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    }
    static copyRequestDef(input, defaultHeaders) {
        let def = {};
        for (let i = 0; i < exports.RequestDefKeys.length; i++) {
            if (input[exports.RequestDefKeys[i]]) {
                def[exports.RequestDefKeys[i]] = input[exports.RequestDefKeys[i]];
            }
        }
        if (!def.headers) {
            if (defaultHeaders) {
                def.headers = defaultHeaders;
            }
            else {
                def.headers = {};
            }
        }
        return def;
    }
    static headersToLower(headers) {
        let headersCopy = {};
        for (let i in headers) {
            if (headers.hasOwnProperty(i)) {
                if (typeof headers[i] == 'string') {
                    headersCopy[i.toLowerCase()] = headers[i].toLowerCase();
                }
                else {
                    headersCopy[i.toLowerCase()] = headers[i];
                }
            }
        }
        return headersCopy;
    }
    static fetch(machine, params, additionalParams, proxyUrl) {
        let paramsCopy = FetchExecutor.copyRequestDef(params);
        if (paramsCopy.headers) {
            paramsCopy.headers = FetchExecutor.headersToLower(paramsCopy.headers);
        }
        if (params.body && typeof params.body === 'object') {
            paramsCopy.body = JSON.stringify(params.body);
        }
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
        let headers = new Headers();
        headers.set('Accept', 'application/json');
        headers.set('Content-Type', 'application/json');
        headers.set('Cache', 'no-cache');
        let fetchParams = {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(paramsCopy)
        };
        let status = null;
        const proxyServerUrl = proxyUrl ? proxyUrl : FetchRequest.PROXY_SERVER_URL;
        const ret = fetchFunction(proxyServerUrl, fetchParams).then((response) => {
            status = response.status;
            return response.json();
        }).then((response) => {
            if (response.error_type && response.error_message) {
                throw new ProxyCommunicationError(response.error_type, response.error_message);
            }
            if (status == ResponseStatus.OK) {
                return response;
            }
            else {
                throw new ProxyCommunicationError('unknown', 'Internal request failed (status: ' + status + ')');
            }
        }).then((response) => {
            if (response.error_type && response.error_message) {
                throw new FetchError(response.error_code, response.error_message);
            }
            let body = null;
            if (response.body) {
                body = FetchExecutor.b64DecodeUnicode(response.body);
            }
            let headers = null;
            if (response.headers) {
                headers = FetchExecutor.headersToLower(response.headers);
            }
            return new FetchResponse(response.status_code, headers, body);
        });
        return new PromiseWraper(ret, new PromiseChainScope(machine));
    }
}
exports.FetchExecutor = FetchExecutor;
class FetchRequest {
    constructor(method, url, body = null) {
        this.method = method;
        this.url = url;
        this.body = body;
    }
}
FetchRequest.PROXY_SERVER_URL = 'http://127.0.0.1:3000/fetch/';
exports.FetchRequest = FetchRequest;
class FetchResponse {
    constructor(status, headers, body) {
        this._status = status;
        this._headers = headers;
        this._body = body;
    }
    get status() {
        return this._status;
    }
    get headers() {
        return this._headers;
    }
    get body() {
        return this._body;
    }
}
exports.FetchResponse = FetchResponse;
class GetRequest extends FetchRequest {
    constructor(url) {
        super('GET', url);
    }
}
exports.GetRequest = GetRequest;
class PostRequest extends FetchRequest {
    constructor(url, body = null) {
        super('POST', url, body);
    }
}
exports.PostRequest = PostRequest;
class PutRequest extends FetchRequest {
    constructor(url, body = null) {
        super('PUT', url, body);
    }
}
exports.PutRequest = PutRequest;
class DeleteRequest extends FetchRequest {
    constructor(url) {
        super('DELETE', url);
    }
}
exports.DeleteRequest = DeleteRequest;
class HeadRequest extends FetchRequest {
    constructor(url) {
        super('HEAD', url);
    }
}
exports.HeadRequest = HeadRequest;
class OptionsRequest extends FetchRequest {
    constructor(url) {
        super('OPTIONS', url);
    }
}
exports.OptionsRequest = OptionsRequest;
