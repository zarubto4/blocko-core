import { Events } from 'common-lib';
import { Connector } from './Connector';
import { Message } from './Message';
import { Block } from './Block';
import { Connection } from './Connection';
import { ConfigProperty } from './ConfigProperty';

export class BlockAddedEvent extends Events.Event {

    public block: Block;

    constructor(block: Block) {
        super('blockAdded');
        this.block = block;
    }
}

export class BlockRemovedEvent extends Events.Event {

    public block: Block;

    constructor(block: Block) {
        super('blockRemoved');
        this.block = block;
    }
}

export class ConnectionAddedEvent extends Events.Event {

    public connection: Connection;

    constructor(connection: Connection) {
        super('connectionAdded');
        this.connection = connection;
    }
}

export class ConnectionRemovedEvent extends Events.Event {

    public connection: Connection;

    constructor(connection: Connection) {
        super('connectionRemoved');
        this.connection = connection;
    }
}

export class ConnectorAddedEvent extends Events.Event {

    public connector: Connector<boolean|number|object|Message>;

    constructor(connector: Connector<boolean|number|object|Message>) {
        super('connectorAdded');
        this.connector = connector;
    }
}

export class ConnectorRemovedEvent extends Events.Event {

    public connector: Connector<boolean|number|object|Message>;

    constructor(connector: Connector<boolean|number|object|Message>) {
        super('connectorRemoved');
        this.connector = connector;
    }
}

export class IOEvent extends Events.Event {

    constructor() {
        super('io');
    }
}

export class DestroyEvent extends Events.Event {
    constructor() {
        super('destroy');
    }
}

export class RuntimeErrorEvent extends Events.Event {
    constructor() {
        super('runtimeError');
    }
}

export class BindInterfaceEvent extends Events.Event {
    constructor() {
        super('bindInterface');
    }
}

export class ConfigPropertyAddedEvent extends Events.Event {

    public configProperty: ConfigProperty;

    constructor(configProperty: ConfigProperty) {
        super('configPropertyAdded');
        this.configProperty = configProperty;
    }
}

export class ConfigPropertyRemovedEvent extends Events.Event {

    public configProperty: ConfigProperty;

    constructor(configProperty: ConfigProperty) {
        super('configPropertyRemoved');
        this.configProperty = configProperty;
    }
}
