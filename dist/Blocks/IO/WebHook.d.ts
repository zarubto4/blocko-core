import { Block, JsonConnector } from '../../Core';
export declare class WebHook extends Block {
    protected output: JsonConnector;
    constructor();
    initialize(): void;
    getJsonOutput(): JsonConnector;
}
