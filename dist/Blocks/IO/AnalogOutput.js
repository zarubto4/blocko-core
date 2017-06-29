"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Core = require("../../Core/index");
const common_lib_1 = require("common-lib");
class AnalogOutput extends Core.Block {
    constructor(id) {
        super(id, "analogOutput", "analogOutput");
        this.connectorInput = this.addInputConnector("input", common_lib_1.Types.ConnectorType.AnalogInput, "Input");
    }
    rendererGetBlockBackgroundColor() {
        return "#d1e7d1";
    }
    rendererGetDisplayName() {
        return this.connectorInput.value.toFixed(1);
    }
    inputChanged(connector, eventType, value) {
        if (this.renderer) {
            this.renderer.refreshDisplayName();
        }
    }
}
exports.AnalogOutput = AnalogOutput;
