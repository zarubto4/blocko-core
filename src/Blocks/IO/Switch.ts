import { DigitalInput } from "./DigitalInput";
import { ConfigProperty, ConnectorEvent, ConnectorEventType } from '../../Core';
import { Types } from 'common-lib';

export class Switch extends DigitalInput {

    protected switchValue: ConfigProperty;

    public constructor(id:string) {
        super(id, "switch");

        this.switchValue = this.addConfigProperty(Types.ConfigPropertyType.Boolean, 'switchValue', 'Switch value', false, { controlPanel: true });
    }

    public rendererGetDisplayName():string {
        return "Switch";
    }

    public rendererGetDisplayNameCursor():string {
        return "hand";
    }

    public onMouseClick(): void {
        if (this.controller) {
            let event: ConnectorEvent = {
                connector: this.connectorOutput,
                eventType:  ConnectorEventType.ValueChange,
                value: !this.connectorOutput.value
            };
            this.sendValueToOutputConnector(event);
            if (this.renderer) {
                // this.renderer.refreshDisplayName();
            }
        }
    }

    public onMouseDrag(event: {dx: number, dy: number}): boolean {
        return true;
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