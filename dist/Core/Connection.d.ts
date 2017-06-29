import { Connector } from "./Connector";
export interface IConnectionRenderer {
    refresh(): void;
    destroy(): void;
    messageHighlight(): void;
}
export declare class Connection {
    connectorA: Connector;
    connectorB: Connector;
    renderer: IConnectionRenderer;
    constructor(connectorA: Connector, connectorB: Connector);
    getOtherConnector(self: Connector): Connector;
    getInputConnector(): Connector;
    getOutputConnector(): Connector;
    disconnect(): void;
}
