"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Connection {
    constructor(connectorA, connectorB) {
        this.connectorA = connectorA;
        this.connectorB = connectorB;
    }
    getOtherConnector(self) {
        if (this.connectorA == self) {
            return this.connectorB;
        }
        else {
            return this.connectorA;
        }
    }
    getInputConnector() {
        if (this.connectorA.isInput())
            return this.connectorA;
        return this.connectorB;
    }
    getOutputConnector() {
        if (this.connectorA.isOutput())
            return this.connectorA;
        return this.connectorB;
    }
    disconnect() {
        this.connectorA._removeConnection(this);
        this.connectorB._removeConnection(this);
        if (this.connectorA && this.connectorA.block && this.connectorA.block.controller) {
            this.connectorA.block.controller._removeConnection(this);
        }
        else if (this.connectorB && this.connectorB.block && this.connectorB.block.controller) {
            this.connectorB.block.controller._removeConnection(this);
        }
        if (this.renderer)
            this.renderer.destroy();
    }
}
exports.Connection = Connection;
