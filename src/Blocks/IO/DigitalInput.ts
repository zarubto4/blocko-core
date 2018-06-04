import * as Core from '../../Core/index';
import { Types } from 'common-lib';

export class DigitalInput extends Core.Block {

    public connectorOutput: Core.Connector;

    public constructor(id: string, visibleType: string) {
        super(id, 'digitalInput', visibleType);
        this.connectorOutput = this.addOutputConnector('output', Types.ConnectorType.DigitalOutput);
    }
}
