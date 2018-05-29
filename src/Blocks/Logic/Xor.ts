

import * as Core from '../../Core/index';
import {Types} from "common-lib";
import { ConnectorEvent } from '../../Core';
import { ConnectorEventType } from '../../Core/Connector';
import { Message } from '../../Core/Message';

export class Xor extends Core.Block {

    public connectorOutput:Core.Connector<boolean|number|Message|Object>;

    protected confInputsCount:Core.ConfigProperty;
    protected confNegate:Core.ConfigProperty;

    public constructor(id:string) {
        super(id, "xor", "xor");

        this.confInputsCount = this.addConfigProperty(Types.ConfigPropertyType.Integer, "inputsCount", "Inputs count", 2, {
            range:true,
            min: 1,
            max: 16
        });
        this.confNegate = this.addConfigProperty(Types.ConfigPropertyType.Boolean, "negate", "Negate", false);

        this.connectorOutput = this.addOutputConnector("output", Types.ConnectorType.DigitalOutput);
        this.configChanged();
    }

    protected afterControllerSet() {
        this.inputsChanged();
    }

    public rendererGetBlockBackgroundColor():string {
        return "#a1887f";
    }

    public rendererGetDisplayName():string {
        return "XOR";
    }

    public configChanged():void {
        var wantedCount = this.confInputsCount.value;
        var currentCount = this.inputConnectors.length;
        var i;
        if (wantedCount > currentCount) {
            for (i = currentCount; i < wantedCount; i++) {
                this.addInputConnector("in"+i, Types.ConnectorType.DigitalInput, "Input "+(i+1));
            }
        } else {
            for (i = wantedCount; i < currentCount; i++) {
                var c = this.getInputConnectorById("in"+i);
                if (c) {
                    this.removeInputConnector(c);
                }
            }
        }
        this.inputsChanged();

        if (this.renderer) this.renderer.refresh();
    }

    public inputsChanged():void {

        var trueValuesCount = 0;

        this.inputConnectors.forEach((con:Core.Connector<boolean|number|Message|Object>) => {
            if (con.value) trueValuesCount++;
        });

        var out = (trueValuesCount % 2 == 1);

        if (this.confNegate.value) {
            out = !out;
        }

        let event: ConnectorEvent = {
            connector: this.connectorOutput,
            eventType:  ConnectorEventType.ValueChange,
            value: out ? 1 : 0
        };

        this.sendValueToOutputConnector(event);
    }

    protected inputChanged(event: ConnectorEvent):void {
        this.inputsChanged();
    }

}
