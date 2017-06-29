/**
 * Created by davidhradek on 12.04.16.
 */

import * as Core from '../../Core/index';
import {Types} from "common-lib";

export class AnalogOutput extends Core.Block {

    public connectorInput:Core.Connector;

    public constructor(id:string) {
        super(id, "analogOutput", "analogOutput");
        this.connectorInput = this.addInputConnector("input", Types.ConnectorType.AnalogInput, "Input");
    }

    public rendererGetBlockBackgroundColor():string {
        return "#d1e7d1";
    }

    public rendererGetDisplayName():string {
        return (<number>this.connectorInput.value).toFixed(1);
    }

    protected inputChanged(connector:Core.Connector, eventType:Core.ConnectorEventType, value:boolean|number|Core.Message):void {
        if (this.renderer) {
            this.renderer.refreshDisplayName();
        }
    }
}