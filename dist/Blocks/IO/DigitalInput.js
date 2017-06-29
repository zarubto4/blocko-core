"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Core = require("../../Core/index");
const common_lib_1 = require("common-lib");
class DigitalInput extends Core.Block {
    constructor(id, visibleType) {
        super(id, "digitalInput", visibleType);
        this.connectorOutput = this.addOutputConnector("output", common_lib_1.Types.ConnectorType.DigitalOutput);
    }
    rendererGetBlockBackgroundColor() {
        if (this.connectorOutput.value) {
            return "#ffd1d1";
        }
        else {
            return "#d1d1ff";
        }
    }
}
exports.DigitalInput = DigitalInput;
