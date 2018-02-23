

import * as Core from '../../Core/index';
import {Types} from "common-lib";
import { ConnectorEvent } from '../../Core';
import { ConnectorEventType } from '../../Core/Connector';

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
                this.renderer.refreshDisplayName();
            }
        }
        return true;
    }

}