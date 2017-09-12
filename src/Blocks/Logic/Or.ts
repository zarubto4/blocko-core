

import * as Core from '../../Core/index';
import {Types} from "common-lib";

export class Or extends Core.Block {

    public connectorOutput:Core.Connector;

    protected confInputsCount:Core.ConfigProperty;
    protected confNegate:Core.ConfigProperty;

    public constructor(id:string) {
        super(id, "or", "or");

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
        return "OR";
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
                var c = this.getInputConnectorByName("in"+i);
                if (c) {
                    this.removeInputConnector(c);
                }
            }
        }
        this.inputsChanged();

        if (this.renderer) this.renderer.refresh();
    }

    public inputsChanged():void {

        var out = false;

        this.inputConnectors.forEach((con:Core.Connector) => {
            if (con.value) out = true;
        });

        if (this.confNegate.value) {
            out = !out;
        }

        this.sendValueToOutputConnector(this.connectorOutput, (out)?1:0);
    }

    protected inputChanged(connector:Core.Connector, eventType:Core.ConnectorEventType, value:boolean|number|Core.Message):void {
        this.inputsChanged();
    }

}