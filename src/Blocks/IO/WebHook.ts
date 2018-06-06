import { Block, JsonConnector } from '../../Core';
import { Types } from 'common-lib';

export class WebHook extends Block {

    protected output: JsonConnector;

    constructor() {
        super(null, 'webHook', 'webHook');

        this.output = <JsonConnector>this.addOutputConnector('output', Types.ConnectorType.JsonOutput, 'JSON Output');
    }

    public getJsonOutput(): JsonConnector {
        return this.output;
    }
}
