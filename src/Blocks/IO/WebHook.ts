import { Block, JsonConnector } from '../../Core';
import { Types } from 'common-lib';

export class WebHook extends Block {

    protected output: JsonConnector;

    constructor() {
        super(null, 'webHook');
        this.name = 'WebHook';
    }

    public initialize(): void {
        this.output = <JsonConnector>this.addOutputConnector('output', Types.ConnectorType.JsonOutput, 'JSON Output');
    }

    public getJsonOutput(): JsonConnector {
        return this.output;
    }
}
