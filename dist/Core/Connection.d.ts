import { Connector } from './Connector';
import { Message } from './Message';
import { DestroyEvent, IOEvent } from './Events';
import { Events } from 'common-lib';
export declare class Connection extends Events.Emitter<IOEvent | DestroyEvent> {
    connectorA: Connector<boolean | number | object | Message>;
    connectorB: Connector<boolean | number | object | Message>;
    constructor(connectorA: Connector<boolean | number | object | Message>, connectorB: Connector<boolean | number | object | Message>);
    getOtherConnector(self: Connector<boolean | number | object | Message>): Connector<boolean | number | object | Message>;
    getInputConnector(): Connector<boolean | number | object | Message>;
    getOutputConnector(): Connector<boolean | number | object | Message>;
    disconnect(): void;
}
