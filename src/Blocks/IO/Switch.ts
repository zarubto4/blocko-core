import { DigitalInput } from "./DigitalInput";
import { ConnectorEvent } from '../../Core';
import { ConnectorEventType } from '../../Core/Connector';

export class Switch extends DigitalInput {

    public constructor(id:string) {
        super(id, "switch");
    }

    public rendererGetDisplayName():string {
        return (this.connectorOutput.value) ? "fa-toggle-on" : "fa-toggle-off";
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
                this.renderer.refreshDisplayName();
            }
        }
    }

    public onMouseDrag(event: {dx: number, dy: number}): boolean {
        return true;
    }
}