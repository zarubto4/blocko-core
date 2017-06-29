/**
 * Created by davidhradek on 12.04.16.
 */

import * as Core from '../../Core/index';
import {Types} from "common-lib";

export class AnalogInput extends Core.Block {

    public connectorOutput:Core.Connector;
    protected currentValue: number = 0;

    public constructor(id:string) {
        super(id, "analogInput", "analogInput");
        this.connectorOutput = this.addOutputConnector("output", Types.ConnectorType.AnalogOutput, "Output");
    }

    public rendererGetBlockBackgroundColor():string {
        return "#d1e7d1";
    }

    public rendererGetDisplayName():string {
        return this.currentValue.toFixed(1);
    }

    public rendererGetDisplayNameCursor():string {
        return "ns-resize";
    }

    public onMouseDrag(event: {dx: number, dy: number}): boolean {
        if (this.controller) {
            this.currentValue -= event.dy * 0.1;
            this.sendValueToOutputConnector(this.connectorOutput, this.currentValue);
            if (this.renderer) {
                this.renderer.refreshDisplayName();
            }
        }
        return true;
    }

}