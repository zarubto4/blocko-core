import { Connector } from './Connector';
import { IRenderer } from './Renderer';
import { Message } from './Message';
export declare class Connection {
    connectorA: Connector<boolean | number | object | Message>;
    connectorB: Connector<boolean | number | object | Message>;
    renderer: IRenderer;
    constructor(connectorA: Connector<boolean | number | object | Message>, connectorB: Connector<boolean | number | object | Message>);
    getOtherConnector(self: Connector<boolean | number | object | Message>): Connector<boolean | number | object | Message>;
    getInputConnector(): Connector<boolean | number | object | Message>;
    getOutputConnector(): Connector<boolean | number | object | Message>;
    disconnect(): void;
}
