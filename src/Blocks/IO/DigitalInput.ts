import { Types } from 'common-lib';
import { Block, DigitalConnector } from '../../Core';

export class DigitalInput extends Block {

    public connectorOutput: DigitalConnector;

    public initialize(): void {
        this.connectorOutput = <DigitalConnector>this.addInputConnector('input', Types.ConnectorType.DigitalInput);
    }
}
