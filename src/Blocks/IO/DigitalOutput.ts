import * as Core from '../../Core/index';
import { Types } from 'common-lib';
import { ConnectorEvent } from '../../Core';

export class DigitalOutput extends Core.Block {

    public connectorInput: Core.Connector;

    public constructor(id: string, visibleType: string) {
        super(id, 'digitalOutput', visibleType);
        this.connectorInput = this.addInputConnector('input', Types.ConnectorType.DigitalInput);
    }

    protected inputChanged(event: ConnectorEvent): void {
        if (this.renderer) {
            // this.renderer.refreshDisplayName();
        }
    }
}
