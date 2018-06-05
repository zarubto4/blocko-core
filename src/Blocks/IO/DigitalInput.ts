import { Types } from 'common-lib';
import { Block, DigitalConnector } from '../../Core';

export class DigitalInput extends Block {

    public connectorOutput: DigitalConnector;

    public constructor(id: string, visibleType: string) {
        super(id, 'digitalInput', visibleType);
        this.connectorOutput = <DigitalConnector>this.addOutputConnector('output', Types.ConnectorType.DigitalOutput);
    }
}
