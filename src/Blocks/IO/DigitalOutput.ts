import { Types } from 'common-lib';
import { Block, ConnectorEvent, DigitalConnector } from '../../Core';

export class DigitalOutput extends Block {

    public connectorInput: DigitalConnector;

    public constructor(id: string, visibleType: string) {
        super(id, 'digitalOutput', visibleType);
        this.connectorInput = <DigitalConnector>this.addInputConnector('input', Types.ConnectorType.DigitalInput);
    }

    protected inputChanged(event: ConnectorEvent): void {
        if (this.renderer) {
            // this.renderer.refreshDisplayName();
        }
    }
}
