/**
 * Created by davidhradek on 12.04.16.
 */

import * as Core from '../../Core/index';
import {Types} from "common-lib";

export class Not extends Core.Block {

    public connectorInput:Core.Connector;
    public connectorOutput:Core.Connector;

    public constructor(id: string) {
        super(id, "not", "not");
        this.connectorInput = this.addInputConnector("input", Types.ConnectorType.DigitalInput);
        this.connectorOutput = this.addOutputConnector("output", Types.ConnectorType.DigitalOutput);
    }

    protected afterControllerSet() {
        this.inputsChanged();
    }

    public rendererGetBlockBackgroundColor(): string {
        return "#a1887f";
    }

    public rendererGetDisplayName(): string {
        return "NOT";
    }

    public inputsChanged(): void {
        this.sendValueToOutputConnector(this.connectorOutput, (this.connectorInput.value == 0) ? 1 : 0);
    }

    protected inputChanged(connector:Core.Connector, eventType:Core.ConnectorEventType, value:boolean|number|Core.Message):void {
        this.inputsChanged();
    }

}