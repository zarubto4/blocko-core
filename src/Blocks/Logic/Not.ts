import * as Core from '../../Core/index';
import { Types } from 'common-lib';
import { ConnectorEventType, DigitalConnector, ConnectorEvent } from '../../Core/Connector';

export class Not extends Core.Block {

    public connectorInput: DigitalConnector;
    public connectorOutput: DigitalConnector;

    public constructor(id: string) {
        super(id, 'not', 'not');
        this.connectorInput = <DigitalConnector>this.addInputConnector('input', Types.ConnectorType.DigitalInput);
        this.connectorOutput = <DigitalConnector>this.addOutputConnector('output', Types.ConnectorType.DigitalOutput);
    }

    protected afterControllerSet() {
        this.inputsChanged();
    }

    public rendererGetDisplayName(): string {
        return 'NOT';
    }

    public inputsChanged(): void {
        let event: ConnectorEvent = {
            connector: this.connectorOutput,
            eventType:  ConnectorEventType.ValueChange,
            value: !this.connectorInput.value
        };
        this.sendValueToOutputConnector(event);
    }

    protected inputChanged(event: ConnectorEvent): void {
        this.inputsChanged();
    }
}
