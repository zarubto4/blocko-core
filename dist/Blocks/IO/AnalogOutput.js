"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Core_1 = require("../../Core");
const common_lib_1 = require("common-lib");
class AnalogOutput extends Core_1.Block {
    constructor(id) {
        super(id, 'analogOutput');
        this.name = 'A-OUT';
    }
    initialize() {
        this.connectorInput = this.addInputConnector('input', common_lib_1.Types.ConnectorType.AnalogInput, 'Input');
        this.analogValue = this.addConfigProperty(common_lib_1.Types.ConfigPropertyType.Float, 'analogValue', 'Analog value', 0.0, { controlPanel: true, precision: 1 });
    }
    inputChanged(event) {
        this.analogValue.value = this.connectorInput.value;
    }
}
exports.AnalogOutput = AnalogOutput;
