import { DigitalInput } from './DigitalInput';
import { ConnectorEvent } from '../../Core';
import { ConnectorEventType } from '../../Core/Connector';

export class PushButton extends DigitalInput {

    public constructor(id:string) {
        super(id, 'pushButton');
    }

    public rendererGetDisplayName():string {
        return 'Button';
    }

    public rendererGetDisplayNameCursor():string {
        return 'hand';
    }

    public onMouseDown(): void {
        if (this.controller) {
            let event: ConnectorEvent = {
                connector: this.connectorOutput,
                eventType:  ConnectorEventType.ValueChange,
                value: true
            };
            this.sendValueToOutputConnector(event);
            if (this.renderer) {
                // this.renderer.refreshDisplayName();
            }
        }
    }

    public onMouseUp(): void {
        if (this.controller) {
            let event: ConnectorEvent = {
                connector: this.connectorOutput,
                eventType:  ConnectorEventType.ValueChange,
                value: false
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

}