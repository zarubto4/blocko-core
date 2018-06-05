import { Block, JsonConnector } from '../../Core';
import { Types } from 'common-lib';

export class WebHook extends Block {

    protected _apiKey: string;

    protected output: JsonConnector;

    constructor(apiKey: string) {
        super(null, 'webHook', 'webHook');
        this._apiKey = apiKey;

        this.output = <JsonConnector>this.addOutputConnector('output', Types.ConnectorType.JsonOutput, 'JSON Output');
    }

    public get apiKey(): string {
        return this._apiKey;
    }

    public getJsonOutput(): JsonConnector {
        return this.output;
    }
}
