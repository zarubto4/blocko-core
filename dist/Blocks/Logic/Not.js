"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Core = require("../../Core/index");
const common_lib_1 = require("common-lib");
const Connector_1 = require("../../Core/Connector");
class Not extends Core.Block {
    constructor(id) {
        super(id, 'not');
        this.name = 'NOT';
        this.description = 'Logical operator NOT is an inverter. It outputs \'true\' if input value is \'false\' and vice versa.';
    }
    initialize() {
        this.connectorInput = this.addInputConnector('input', common_lib_1.Types.ConnectorType.DigitalInput);
        this.connectorOutput = this.addOutputConnector('output', common_lib_1.Types.ConnectorType.DigitalOutput);
        this.inputsChanged();
    }
    inputsChanged() {
        let event = {
            connector: this.connectorOutput,
            eventType: Connector_1.ConnectorEventType.ValueChange,
            value: !this.connectorInput.value
        };
        this.sendValueToOutputConnector(event);
    }
    inputChanged(event) {
        this.inputsChanged();
    }
}
exports.Not = Not;
