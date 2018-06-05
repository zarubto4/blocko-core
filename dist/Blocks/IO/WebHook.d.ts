import { Block, JsonConnector } from '../../Core';
export declare class WebHook extends Block {
    protected _apiKey: string;
    protected output: JsonConnector;
    constructor(apiKey: string);
    readonly apiKey: string;
    getJsonOutput(): JsonConnector;
}
