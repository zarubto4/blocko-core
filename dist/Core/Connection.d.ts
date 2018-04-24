import { Connector } from './Connector';
import { IRenderer } from './Renderer';
export declare class Connection {
    connectorA: Connector;
    connectorB: Connector;
    renderer: IRenderer;
    constructor(connectorA: Connector, connectorB: Connector);
    getOtherConnector(self: Connector): Connector;
    getInputConnector(): Connector;
    getOutputConnector(): Connector;
    disconnect(): void;
}
