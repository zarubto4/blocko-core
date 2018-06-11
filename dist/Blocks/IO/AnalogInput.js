"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Core_1 = require("../../Core");
const common_lib_1 = require("common-lib");
class AnalogInput extends Core_1.Block {
    constructor(id) {
        super(id, 'analogInput');
        this.currentValue = 0;
        this.name = 'A-IN';
    }
    initialize() {
        this.connectorOutput = this.addOutputConnector('output', common_lib_1.Types.ConnectorType.AnalogOutput, 'Output');
        this.analogValue = this.addConfigProperty(common_lib_1.Types.ConfigPropertyType.Float, 'analogValue', 'Analog value', 0.0, { controlPanel: true, precision: 1, input: true });
    }
    configChanged() {
        if (this.controller) {
            let event = {
                connector: this.connectorOutput,
                eventType: Core_1.ConnectorEventType.ValueChange,
                value: this.analogValue.value
            };
            this.sendValueToOutputConnector(event);
        }
    }
}
exports.AnalogInput = AnalogInput;
