import { Connector } from './Connector';
import { IRenderer } from './Renderer';
import { Message } from './Message';
export declare class Connection {
    connectorA: Connector<boolean | number | Message | Object>;
    connectorB: Connector<boolean | number | Message | Object>;
    renderer: IRenderer;
    constructor(connectorA: Connector<boolean | number | Message | Object>, connectorB: Connector<boolean | number | Message | Object>);
    getOtherConnector(self: Connector<boolean | number | Message | Object>): Connector<boolean | number | Message | Object>;
    getInputConnector(): Connector<boolean | number | Message | Object>;
    getOutputConnector(): Connector<boolean | number | Message | Object>;
    disconnect(): void;
}
