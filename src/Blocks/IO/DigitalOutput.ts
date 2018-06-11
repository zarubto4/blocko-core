import { Types } from 'common-lib';
import { Block, ConnectorEvent, DigitalConnector } from '../../Core';

export class DigitalOutput extends Block {

    public connectorInput: DigitalConnector;

    public initialize(): void {
        this.connectorInput = <DigitalConnector>this.addInputConnector('input', Types.ConnectorType.DigitalInput);
    }
}
