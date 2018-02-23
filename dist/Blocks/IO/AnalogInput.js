"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Core = require("../../Core/index");
const common_lib_1 = require("common-lib");
const Connector_1 = require("../../Core/Connector");
class AnalogInput extends Core.Block {
    constructor(id) {
        super(id, "analogInput", "analogInput");
        this.currentValue = 0;
        this.connectorOutput = this.addOutputConnector("output", common_lib_1.Types.ConnectorType.AnalogOutput, "Output");
    }
    rendererGetBlockBackgroundColor() {
        return "#d1e7d1";
    }
    rendererGetDisplayName() {
        return this.currentValue.toFixed(1);
    }
    rendererGetDisplayNameCursor() {
        return "ns-resize";
    }
    onMouseDrag(e) {
        if (this.controller) {
            this.currentValue -= e.dy * 0.1;
            let event = {
                connector: this.connectorOutput,
                eventType: Connector_1.ConnectorEventType.ValueChange,
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
exports.AnalogInput = AnalogInput;
