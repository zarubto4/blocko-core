"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DigitalInput_1 = require("./DigitalInput");
const Connector_1 = require("../../Core/Connector");
const common_lib_1 = require("common-lib");
class PushButton extends DigitalInput_1.DigitalInput {
    constructor(id) {
        super(id, 'pushButton');
        this.name = 'Button';
        this.description = 'TODO';
    }
    initialize() {
        super.initialize();
        this.buttonValue = this.addConfigProperty(common_lib_1.Types.ConfigPropertyType.Boolean, 'buttonValue', 'Button value', false, { controlPanel: true, controlPanelButton: true });
    }
    configChanged() {
        if (this.controller) {
            let event = {
                connector: this.connectorOutput,
                eventType: Connector_1.ConnectorEventType.ValueChange,
                value: this.buttonValue.value
            };
            this.sendValueToOutputConnector(event);
        }
    }
}
exports.PushButton = PushButton;
