import { DigitalInput } from './DigitalInput';

export class PushButton extends DigitalInput {

    public constructor(id:string) {
        super(id, 'pushButton');
    }

    public rendererGetDisplayName():string {
        return (this.connectorOutput) ? 'fa-dot-circle-o' : 'fa-circle-o';
    }

    public rendererGetDisplayNameCursor():string {
        return 'hand';
    }

    public onMouseDown(): void {
        if (this.controller) {
            this.sendValueToOutputConnector(this.connectorOutput, true);
            if (this.renderer) {
                this.renderer.refreshDisplayName();
            }
        }
    }

    public onMouseUp(): void {
        if (this.controller) {
            this.sendValueToOutputConnector(this.connectorOutput, false);
            if (this.renderer) {
                this.renderer.refreshDisplayName();
            }
        }
    }

    public onMouseDrag(event: {dx: number, dy: number}): boolean {
        return true;
    }

}