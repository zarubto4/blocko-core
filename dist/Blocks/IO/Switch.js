"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DigitalInput_1 = require("./DigitalInput");
const Core_1 = require("../../Core");
const common_lib_1 = require("common-lib");
class Switch extends DigitalInput_1.DigitalInput {
    constructor(id) {
        super(id, 'switch');
        this.name = 'Switch';
        this.description = 'Switch block is a digital input into blocko, which holds the value until it is switched again.';
    }
    initialize() {
        super.initialize();
        this.switchValue = this.addConfigProperty(common_lib_1.Types.ConfigPropertyType.Boolean, 'switchValue', 'Switch value', false, { controlPanel: true });
    }
    configChanged() {
        if (this.controller) {
            let event = {
                connector: this.connectorOutput,
                eventType: Core_1.ConnectorEventType.ValueChange,
                value: this.switchValue.value
            };
            this.sendValueToOutputConnector(event);
        }
    }
}
exports.Switch = Switch;
