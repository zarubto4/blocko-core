"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Core = require("../../Core/index");
const common_lib_1 = require("common-lib");
const Connector_1 = require("../../Core/Connector");
class Not extends Core.Block {
    constructor(id) {
        super(id, 'not', 'not');
        this.connectorInput = this.addInputConnector('input', common_lib_1.Types.ConnectorType.DigitalInput);
        this.connectorOutput = this.addOutputConnector('output', common_lib_1.Types.ConnectorType.DigitalOutput);
    }
    afterControllerSet() {
        this.inputsChanged();
    }
    rendererGetDisplayName() {
        return 'NOT';
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
