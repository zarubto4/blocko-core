"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FetchService_1 = require("./FetchService");
const Fetch_1 = require("../../Core/Fetch");
class XmlApiService extends FetchService_1.FetchService {
    get libTypings() {
        return XmlApiService.libTypings;
    }
    get name() {
        return XmlApiService.serviceName;
    }
    static decodeXml(xmlStr) {
        let DOMParser = null;
        if (typeof window['DOMParser'] !== 'undefined') {
            return (new window['DOMParser']()).parseFromString(xmlStr, 'text/xml');
        }
        else if (typeof window['ActiveXObject'] !== 'undefined' && new window['ActiveXObject']('Microsoft.XMLDOM')) {
            let xmlDoc = new window['ActiveXObject']('Microsoft.XMLDOM');
            xmlDoc.async = 'false';
            xmlDoc.loadXML(xmlStr);
            return xmlDoc;
        }
        else if (typeof require === 'function') {
            const xmlDomPackageName = 'xmldom';
            DOMParser = eval('require(xmlDomPackageName).DOMParser');
            return DOMParser.parseFromString(xmlStr, 'text/xml');
        }
        else {
            throw new Error('No XML parser found');
        }
    }
    static encodeXml(xml) {
        let DOMParser = null;
        if (typeof window['XMLSerializer'] !== 'undefined') {
            return new XMLSerializer().serializeToString(xml);
        }
        else if (window['ActiveXObject'] !== 'undefined') {
            return xml.xml;
        }
        else if (typeof require === 'function') {
            const xmlDomPackageName = 'xmldom';
            DOMParser = eval('require(xmlDomPackageName).DOMParser');
            return DOMParser.serializeToString(xml);
        }
        else {
            throw new Error('No XML parser found');
        }
    }
    fetch(request) {
        let originalResponse;
        let requestCopy = Fetch_1.FetchExecutor.copyRequestDef(request, XmlApiService.defaultHeaders);
        if (requestCopy.body) {
            if (typeof requestCopy.body === 'object') {
                requestCopy.body = XmlApiService.encodeXml(requestCopy.body);
            }
            else if (typeof requestCopy.body === 'string') {
                requestCopy.body = requestCopy.body;
            }
            else {
                throw new Error('Body of request is not valid for us with xml api service');
            }
        }
        return super.fetch(requestCopy)
            .then((res) => {
            originalResponse = res;
            return XmlApiService.decodeXml(res.body);
        }).then((json) => {
            return new Fetch_1.FetchResponse(originalResponse.status, originalResponse.headers, json);
        });
    }
}
XmlApiService.serviceName = 'xmlApiService';
XmlApiService.libTypings = `
    declare class XmlApiService {
        /**
         * Fetch request with converting body to json
         */
        fetch(request: RequestDef): Promise<FetchResponse>;
    }

    declare module services {
        const xmlApiService: XmlApiService;
    };
    `;
XmlApiService.defaultHeaders = {
    'Accept': 'text/xml',
    'Content-Type': 'text/xml',
    'Cache': 'no-cache'
};
exports.XmlApiService = XmlApiService;
