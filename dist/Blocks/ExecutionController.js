"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ExecutionController {
    constructor(controller) {
        controller.registerConnectionAddedCallback(connection => this.connectionAdded(connection));
        controller.registerConnectionRemovedCallback(connection => this.connectionRemoved(connection));
        controller.connections.forEach(connection => this.connectionAdded(connection));
    }
    connectionAdded(connection) {
        if (connection.getInputConnector().isDigital() || connection.getInputConnector().isAnalog()) {
            connection.getInputConnector()._inputSetValue(connection.getOutputConnector().value);
        }
    }
    connectionRemoved(connection) {
        if (connection.getInputConnector().isDigital()) {
            connection.getInputConnector()._inputSetValue(false);
        }
        if (connection.getInputConnector().isAnalog()) {
            connection.getInputConnector()._inputSetValue(0);
        }
    }
}
exports.ExecutionController = ExecutionController;
