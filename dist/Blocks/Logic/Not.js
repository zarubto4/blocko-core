"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Core = require("../../Core/index");
const common_lib_1 = require("common-lib");
class Not extends Core.Block {
    constructor(id) {
        super(id, "not", "not");
        this.connectorInput = this.addInputConnector("input", common_lib_1.Types.ConnectorType.DigitalInput);
        this.connectorOutput = this.addOutputConnector("output", common_lib_1.Types.ConnectorType.DigitalOutput);
    }
    afterControllerSet() {
        this.inputsChanged();
    }
    rendererGetBlockBackgroundColor() {
        return "#a1887f";
    }
    rendererGetDisplayName() {
        return "NOT";
    }
    inputsChanged() {
        this.sendValueToOutputConnector(this.connectorOutput, (this.connectorInput.value == 0) ? 1 : 0);
    }
    inputChanged(connector, eventType, value) {
        this.inputsChanged();
    }
}
exports.Not = Not;
