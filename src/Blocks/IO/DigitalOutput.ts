

import * as Core from '../../Core/index';
import {Types} from "common-lib";

export class DigitalOutput extends Core.Block {

    public connectorInput:Core.Connector;

    public constructor(id:string, visibleType:string) {
        super(id, "digitalOutput", visibleType);
        this.connectorInput = this.addInputConnector("input", Types.ConnectorType.DigitalInput);
    }

    public rendererGetDisplayNameCursor():string {
        return "hand";
    }

    public rendererGetBlockBackgroundColor():string {
        if (this.connectorInput.value) {
            return "#ffd1d1";
        } else {
            return "#d1d1ff";
        }
    }

    protected inputChanged(connector:Core.Connector, eventType:Core.ConnectorEventType, value:boolean|number|Core.Message):void {
        if (this.renderer) {
            this.renderer.refreshDisplayName();
        }
    }

}