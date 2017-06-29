"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DigitalInput_1 = require("./DigitalInput");
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
            this.sendValueToOutputConnector(this.connectorOutput, !this.connectorOutput.value);
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
