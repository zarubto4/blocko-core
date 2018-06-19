import { DigitalInput } from './DigitalInput';
import { ConfigProperty, ConnectorEvent, ConnectorEventType } from '../../Core';
import { Types } from 'common-lib';

export class Switch extends DigitalInput {

    protected switchValue: ConfigProperty;

    public constructor(id: string) {
        super(id, 'switch');
        this.name = 'Switch';
        this.description = 'Switch block is a digital input into blocko, which holds the value until it is switched again.';
    }

    public initialize(): void {
        super.initialize();
        this.switchValue = this.addConfigProperty(Types.ConfigPropertyType.Boolean, 'switchValue', 'Switch value', false, { controlPanel: true });
    }

    public configChanged(): void {
        if (this.controller) {
            let event: ConnectorEvent = {
                connector: this.connectorOutput,
                eventType:  ConnectorEventType.ValueChange,
                value: this.switchValue.value
            };
            this.sendValueToOutputConnector(event);
        }
    }
}
