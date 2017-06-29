/**
 * Created by davidhradek on 12.04.16.
 */

import * as Core from '../../Core/index';
import {Types} from "common-lib";

export class DigitalInput extends Core.Block {

    public connectorOutput:Core.Connector;

    public constructor(id:string, visibleType:string) {
        super(id, "digitalInput", visibleType);
        this.connectorOutput = this.addOutputConnector("output", Types.ConnectorType.DigitalOutput);
    }

    public rendererGetBlockBackgroundColor():string {
        if (this.connectorOutput.value) {
            return "#ffd1d1";
        } else {
            return "#d1d1ff";
        }
    }

}