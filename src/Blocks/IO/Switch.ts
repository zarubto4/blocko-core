

import * as Core from '../../Core/index';
import {DigitalInput} from "./DigitalInput";

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
            this.sendValueToOutputConnector(this.connectorOutput, !this.connectorOutput.value);
            if (this.renderer) {
                this.renderer.refreshDisplayName();
            }
        }
    }

    public onMouseDrag(event: {dx: number, dy: number}): boolean {
        return true;
    }
}