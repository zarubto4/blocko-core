import { Events } from 'common-lib';
import { Connector } from './Connector';
import { Message } from './Message';
import { Block } from './Block';
import { Connection } from './Connection';
import { ConfigProperty } from './ConfigProperty';
export declare class BlockAddedEvent extends Events.Event {
    block: Block;
    constructor(block: Block);
}
export declare class BlockRemovedEvent extends Events.Event {
    block: Block;
    constructor(block: Block);
}
export declare class ConnectionAddedEvent extends Events.Event {
    connection: Connection;
    constructor(connection: Connection);
}
export declare class ConnectionRemovedEvent extends Events.Event {
    connection: Connection;
    constructor(connection: Connection);
}
export declare class ConnectorAddedEvent extends Events.Event {
    connector: Connector<boolean | number | object | Message>;
    constructor(connector: Connector<boolean | number | object | Message>);
}
export declare class ConnectorRemovedEvent extends Events.Event {
    connector: Connector<boolean | number | object | Message>;
    constructor(connector: Connector<boolean | number | object | Message>);
}
export declare class IOEvent extends Events.Event {
    constructor();
}
export declare class DestroyEvent extends Events.Event {
    constructor();
}
export declare class RuntimeErrorEvent extends Events.Event {
    constructor();
}
export declare class BindInterfaceEvent extends Events.Event {
    constructor();
}
export declare class ConfigPropertyAddedEvent extends Events.Event {
    configProperty: ConfigProperty;
    constructor(configProperty: ConfigProperty);
}
export declare class ConfigPropertyRemovedEvent extends Events.Event {
    configProperty: ConfigProperty;
    constructor(configProperty: ConfigProperty);
}
