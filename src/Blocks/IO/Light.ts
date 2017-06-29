/**
 * Created by davidhradek on 12.04.16.
 */

import * as Core from '../../Core/index';
import {DigitalOutput} from "./DigitalOutput";

export class Light extends DigitalOutput {

    public constructor(id:string) {
        super(id, "light");
    }

    public rendererGetDisplayName():string {
        return (this.connectorInput.value) ? "fa-star" : "fa-star-o";
    }

}