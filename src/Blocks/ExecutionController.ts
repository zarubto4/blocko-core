import * as Core from "../Core";

export class ExecutionController {

    constructor(controller:Core.Controller) {
        controller.registerConnectionAddedCallback(connection => this.connectionAdded(connection));
        controller.registerConnectionRemovedCallback(connection => this.connectionRemoved(connection));
        controller.connections.forEach(connection => this.connectionAdded(connection));
    }

    private connectionAdded(connection:Core.Connection):void {
        // send value when init
        if (connection.getInputConnector().isDigital() || connection.getInputConnector().isAnalog()) {
            connection.getInputConnector()._inputSetValue(connection.getOutputConnector().value);
        }
    }

    private connectionRemoved(connection:Core.Connection):void {
        if (connection.getInputConnector().isDigital()) {
            connection.getInputConnector()._inputSetValue(false);
        }
        if (connection.getInputConnector().isAnalog()) {
            connection.getInputConnector()._inputSetValue(0);
        }
    }
}