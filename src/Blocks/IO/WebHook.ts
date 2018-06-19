import { Block, JsonConnector } from '../../Core';
import { Types } from 'common-lib';

export class WebHook extends Block {

    protected output: JsonConnector;

    constructor() {
        super(null, 'webHook');
        this.name = 'WebHook';
        this.description = 'WebHook serves as a HTTP endpoint, which sends the body of the HTTP request to its output connector, if requested.';
    }

    public initialize(): void {
        this.output = <JsonConnector>this.addOutputConnector('output', Types.ConnectorType.JsonOutput, 'JSON Output');
    }

    public getJsonOutput(): JsonConnector {
        return this.output;
    }
}
