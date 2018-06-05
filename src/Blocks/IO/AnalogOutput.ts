import { AnalogConnector, Block, ConfigProperty, ConnectorEvent } from '../../Core';
import { Types } from 'common-lib';

export class AnalogOutput extends Block {

    public connectorInput: AnalogConnector;
    protected analogValue: ConfigProperty;

    public constructor(id: string) {
        super(id, 'analogOutput', 'analogOutput');
        this.connectorInput = <AnalogConnector>this.addInputConnector('input', Types.ConnectorType.AnalogInput, 'Input');
        this.analogValue = this.addConfigProperty(Types.ConfigPropertyType.Float, 'analogValue', 'Analog value', 0.0, { controlPanel: true, precision: 1 })
    }

    public rendererGetDisplayName(): string {
        return 'A-OUT'
    }

    protected inputChanged(event: ConnectorEvent): void {
        this.analogValue.value = this.connectorInput.value;
    }
}
