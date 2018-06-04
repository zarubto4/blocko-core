import { Block, ConfigProperty, Connector, ConnectorEvent } from '../../Core';
import { Types } from 'common-lib';
import { Message } from '../../Core/Message';

export class AnalogOutput extends Block {

    public connectorInput: Connector<boolean|number|Message|Object>;
    protected analogValue: ConfigProperty;

    public constructor(id: string) {
        super(id, 'analogOutput', 'analogOutput');
        this.connectorInput = this.addInputConnector('input', Types.ConnectorType.AnalogInput, 'Input');
        this.analogValue = this.addConfigProperty(Types.ConfigPropertyType.Float, 'analogValue', 'Analog value', 0.0, { controlPanel: true, precision: 1 })
    }

    public rendererGetDisplayName(): string {
        return 'A-OUT'
    }

    protected inputChanged(event: ConnectorEvent): void {
        this.analogValue.value = this.connectorInput.value;
    }
}
