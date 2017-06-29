/**
 * Created by David Uhlíř on 10.04.17.
 */

import { FetchService } from './FetchService';
import { FetchResponse, RequestDef, FetchExecutor, PromiseWraper } from '../../Core/Fetch';

declare const require;
/*
 *
 * Base api service
 * 
 */
export class XmlApiService extends FetchService {
    public static serviceName:string = "xmlApiService";
    public static libTypings:string = `
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

    public get libTypings(): string {
        return XmlApiService.libTypings;
    }

    static defaultHeaders = {
        'Accept': 'text/xml',
        'Content-Type': 'text/xml',
        'Cache': 'no-cache'
    };

    public get name(): string {
        return XmlApiService.serviceName
    }

    /**
     * 
     * Utility for decode XML
     * 
     */
    public static decodeXml(xmlStr): Object {
        let DOMParser = null;
        
         if (typeof window['DOMParser'] != 'undefined') {
             return ( new window['DOMParser']() ).parseFromString(xmlStr, 'text/xml');
         } else if (typeof window['ActiveXObject'] != 'undefined' && new window['ActiveXObject']('Microsoft.XMLDOM')) {
            var xmlDoc = new window['ActiveXObject']('Microsoft.XMLDOM');
            xmlDoc.async = 'false';
            xmlDoc.loadXML(xmlStr);
            return xmlDoc;
        } else if (typeof require === "function") {
            const xmlDomPackageName = 'xmldom';
            DOMParser = eval("require(xmlDomPackageName).DOMParser");
            return DOMParser.parseFromString(xmlStr, 'text/xml');
        } else {
            throw new Error('No XML parser found');
        }
    }

    /**
     * 
     * Utility for encode XML
     * 
     */
    public static encodeXml(xml) {
        let DOMParser = null;

        if (typeof window['XMLSerializer'] != 'undefined') {
            return new XMLSerializer().serializeToString(xml);
        } else if (window['ActiveXObject'] != 'undefined') { 
            return xml.xml; 
        } else if (typeof require === "function") {
            const xmlDomPackageName = 'xmldom';
            DOMParser = eval("require(xmlDomPackageName).DOMParser");
            return DOMParser.serializeToString(xml);
        } else {
            throw new Error('No XML parser found');
        }
    }

    /**
     * 
     * Fetch with converting to xml and from xml...
     * 
     */
    public fetch(request: RequestDef): PromiseWraper<FetchResponse> {
        let originalResponse: FetchResponse;
        let requestCopy = FetchExecutor.copyRequestDef(request, XmlApiService.defaultHeaders);

        if (requestCopy.body) {
            if (typeof requestCopy.body == 'object') {
                requestCopy.body = XmlApiService.encodeXml(requestCopy.body);
            } else if (typeof requestCopy.body == 'string') {
                requestCopy.body = requestCopy.body;
            } else {
                throw 'Body of request is not valid for us with xml api service';
            }
        }

        return super.fetch(requestCopy)
            .then((res: FetchResponse) => {
                originalResponse = res;
                return XmlApiService.decodeXml(res.body);
            }).then((json: any) => {
                return new FetchResponse(originalResponse.status, originalResponse.headers, json);
            });
    }
}