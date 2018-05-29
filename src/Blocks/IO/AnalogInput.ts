import { Block, ConfigProperty, Connector, ConnectorEvent, ConnectorEventType } from '../../Core';
import { Types } from 'common-lib';
import { Message } from '../../Core/Message';

export class AnalogInput extends Block {

    public connectorOutput: Connector<boolean|number|Message|Object>;
    protected currentValue: number = 0;
    
    protected analogValue: ConfigProperty;

    public constructor(id:string) {
        super(id, 'analogInput', 'analogInput');
        this.connectorOutput = this.addOutputConnector('output', Types.ConnectorType.AnalogOutput, 'Output');
        
        this.analogValue = this.addConfigProperty(Types.ConfigPropertyType.Float, 'analogValue', 'Analog value', 0.0, { controlPanel: true, precision: 1, input: true })
    }

    public rendererGetBlockBackgroundColor():string {
        return '#d1e7d1';
    }

    public rendererGetDisplayName():string {
        return 'A-IN';
    }

    public rendererGetDisplayNameCursor():string {
        return 'ns-resize';
    }

    public onMouseDrag(e: {dx: number, dy: number}): boolean {
        if (this.controller) {
            this.currentValue -= e.dy * 0.1;
            let event: ConnectorEvent = {
                connector: this.connectorOutput,
                eventType:  ConnectorEventType.ValueChange,
                value: this.currentValue
            };
            this.sendValueToOutputConnector(event);
            if (this.renderer) {
                // this.renderer.refreshDisplayName();
            }
        }
        return true;
    }

    public configChanged(): void {
        if (this.controller) {
            let event: ConnectorEvent = {
                connector: this.connectorOutput,
                eventType:  ConnectorEventType.ValueChange,
                value: this.analogValue.value
            };
            this.sendValueToOutputConnector(event);
        }
    }
}