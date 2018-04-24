"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DigitalInput_1 = require("./DigitalInput");
const Core_1 = require("../../Core");
const common_lib_1 = require("common-lib");
class Switch extends DigitalInput_1.DigitalInput {
    constructor(id) {
        super(id, "switch");
        this.switchValue = this.addConfigProperty(common_lib_1.Types.ConfigPropertyType.Boolean, 'switchValue', 'Switch value', false, { controlPanel: true });
    }
    rendererGetDisplayName() {
        return "Switch";
    }
    rendererGetDisplayNameCursor() {
        return "hand";
    }
    onMouseClick() {
        if (this.controller) {
            let event = {
                connector: this.connectorOutput,
                eventType: Core_1.ConnectorEventType.ValueChange,
                value: !this.connectorOutput.value
            };
            this.sendValueToOutputConnector(event);
            if (this.renderer) {
            }
        }
    }
    onMouseDrag(event) {
        return true;
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
