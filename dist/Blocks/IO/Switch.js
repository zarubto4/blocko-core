"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DigitalInput_1 = require("./DigitalInput");
const Connector_1 = require("../../Core/Connector");
class Switch extends DigitalInput_1.DigitalInput {
    constructor(id) {
        super(id, "switch");
    }
    rendererGetDisplayName() {
        return (this.connectorOutput.value) ? "fa-toggle-on" : "fa-toggle-off";
    }
    rendererGetDisplayNameCursor() {
        return "hand";
    }
    onMouseClick() {
        if (this.controller) {
            let event = {
                connector: this.connectorOutput,
                eventType: Connector_1.ConnectorEventType.ValueChange,
                value: !this.connectorOutput.value
            };
            this.sendValueToOutputConnector(event);
            if (this.renderer) {
                this.renderer.refreshDisplayName();
            }
        }
    }
    onMouseDrag(event) {
        return true;
    }
}
exports.Switch = Switch;
