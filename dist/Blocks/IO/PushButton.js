"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DigitalInput_1 = require("./DigitalInput");
const Connector_1 = require("../../Core/Connector");
class PushButton extends DigitalInput_1.DigitalInput {
    constructor(id) {
        super(id, 'pushButton');
    }
    rendererGetDisplayName() {
        return 'Button';
    }
    rendererGetDisplayNameCursor() {
        return 'hand';
    }
    onMouseDown() {
        if (this.controller) {
            let event = {
                connector: this.connectorOutput,
                eventType: Connector_1.ConnectorEventType.ValueChange,
                value: true
            };
            this.sendValueToOutputConnector(event);
            if (this.renderer) {
            }
        }
    }
    onMouseUp() {
        if (this.controller) {
            let event = {
                connector: this.connectorOutput,
                eventType: Connector_1.ConnectorEventType.ValueChange,
                value: false
            };
            this.sendValueToOutputConnector(event);
            if (this.renderer) {
            }
        }
    }
    onMouseDrag(event) {
        return true;
    }
}
exports.PushButton = PushButton;
