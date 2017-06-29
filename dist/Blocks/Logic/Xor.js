"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Core = require("../../Core/index");
const common_lib_1 = require("common-lib");
class Xor extends Core.Block {
    constructor(id) {
        super(id, "xor", "xor");
        this.confInputsCount = this.addConfigProperty(common_lib_1.Types.ConfigPropertyType.Integer, "inputsCount", "Inputs count", 2, {
            range: true,
            min: 1,
            max: 16
        });
        this.confNegate = this.addConfigProperty(common_lib_1.Types.ConfigPropertyType.Boolean, "negate", "Negate", false);
        this.connectorOutput = this.addOutputConnector("output", common_lib_1.Types.ConnectorType.DigitalOutput);
        this.configChanged();
    }
    afterControllerSet() {
        this.inputsChanged();
    }
    rendererGetBlockBackgroundColor() {
        return "#a1887f";
    }
    rendererGetDisplayName() {
        return "XOR";
    }
    configChanged() {
        var wantedCount = this.confInputsCount.value;
        var currentCount = this.inputConnectors.length;
        var i;
        if (wantedCount > currentCount) {
            for (i = currentCount; i < wantedCount; i++) {
                this.addInputConnector("in" + i, common_lib_1.Types.ConnectorType.DigitalInput, "Input " + (i + 1));
            }
        }
        else {
            for (i = wantedCount; i < currentCount; i++) {
                var c = this.getInputConnectorByName("in" + i);
                if (c) {
                    this.removeInputConnector(c);
                }
            }
        }
        this.inputsChanged();
        if (this.renderer)
            this.renderer.refresh();
    }
    inputsChanged() {
        var trueValuesCount = 0;
        this.inputConnectors.forEach((con) => {
            if (con.value)
                trueValuesCount++;
        });
        var out = (trueValuesCount % 2 == 1);
        if (this.confNegate.value) {
            out = !out;
        }
        this.sendValueToOutputConnector(this.connectorOutput, (out) ? 1 : 0);
    }
    inputChanged(connector, eventType, value) {
        this.inputsChanged();
    }
}
exports.Xor = Xor;
