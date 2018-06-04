import * as Core from '../../Core/index';
import { Types } from 'common-lib';
import { Message } from '../../Core/Message';

export class DigitalInput extends Core.Block {

    public connectorOutput: Core.Connector<boolean|number|Message|Object>;

    public constructor(id: string, visibleType: string) {
        super(id, 'digitalInput', visibleType);
        this.connectorOutput = this.addOutputConnector('output', Types.ConnectorType.DigitalOutput);
    }
}
