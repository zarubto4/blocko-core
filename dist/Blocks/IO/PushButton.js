"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DigitalInput_1 = require("./DigitalInput");
class PushButton extends DigitalInput_1.DigitalInput {
    constructor(id) {
        super(id, "pushButton");
    }
    rendererGetDisplayName() {
        return (this.connectorOutput) ? "fa-dot-circle-o" : "fa-circle-o";
    }
    rendererGetDisplayNameCursor() {
        return "hand";
    }
    onMouseDown() {
        if (this.controller) {
            this.sendValueToOutputConnector(this.connectorOutput, true);
            if (this.renderer) {
                this.renderer.refreshDisplayName();
            }
        }
    }
    onMouseUp() {
        if (this.controller) {
            this.sendValueToOutputConnector(this.connectorOutput, false);
            if (this.renderer) {
                this.renderer.refreshDisplayName();
            }
        }
    }
    onMouseDrag(event) {
        return true;
    }
}
exports.PushButton = PushButton;
