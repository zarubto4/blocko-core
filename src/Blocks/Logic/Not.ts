import * as Core from '../../Core/index';
import { Types } from 'common-lib';
import { ConnectorEventType, DigitalConnector, ConnectorEvent } from '../../Core/Connector';

export class Not extends Core.Block {

    public connectorInput: DigitalConnector;
    public connectorOutput: DigitalConnector;

    public constructor(id: string) {
        super(id, 'not');
        this.name = 'NOT';
        this.description = 'Logical operator NOT is an inverter. It outputs \'true\' if input value is \'false\' and vice versa.';
    }

    public initialize(): void {
        this.connectorInput = <DigitalConnector>this.addInputConnector('input', Types.ConnectorType.DigitalInput);
        this.connectorOutput = <DigitalConnector>this.addOutputConnector('output', Types.ConnectorType.DigitalOutput);
        this.inputsChanged();
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
