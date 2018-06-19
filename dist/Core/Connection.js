"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Events_1 = require("./Events");
const common_lib_1 = require("common-lib");
class Connection extends common_lib_1.Events.Emitter {
    constructor(connectorA, connectorB) {
        super();
        this.connectorA = connectorA;
        this.connectorB = connectorB;
    }
    getOtherConnector(self) {
        if (this.connectorA === self) {
            return this.connectorB;
        }
        else {
            return this.connectorA;
        }
    }
    getInputConnector() {
        return this.connectorA.isInput() ? this.connectorA : this.connectorB;
    }
    getOutputConnector() {
        return this.connectorA.isOutput() ? this.connectorA : this.connectorB;
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
        this.emit(this, new Events_1.DestroyEvent());
    }
}
exports.Connection = Connection;
