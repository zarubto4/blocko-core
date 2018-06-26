import { DigitalInput } from './DigitalInput';
import { ConfigProperty, ConnectorEvent } from '../../Core';
import { ConnectorEventType } from '../../Core/Connector';
import { Types } from 'common-lib';

export class PushButton extends DigitalInput {

    protected buttonValue: ConfigProperty;

    public constructor(id: string) {
        super(id, 'pushButton');
        this.name = 'Button';
        this.description = 'TODO';
    }

    public initialize(): void {
        super.initialize();
        this.buttonValue = this.addConfigProperty(Types.ConfigPropertyType.Boolean, 'buttonValue', 'Button value', false, { controlPanel: true, controlPanelButton: true });
    }

    public configChanged(): void {
        if (this.controller) {
            let event: ConnectorEvent = {
                connector: this.connectorOutput,
                eventType:  ConnectorEventType.ValueChange,
                value: this.buttonValue.value
            };
            this.sendValueToOutputConnector(event);
        }
    }
}
