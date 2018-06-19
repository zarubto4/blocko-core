"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_lib_1 = require("common-lib");
class BlockAddedEvent extends common_lib_1.Events.Event {
    constructor(block) {
        super('blockAdded');
        this.block = block;
    }
}
exports.BlockAddedEvent = BlockAddedEvent;
class BlockRemovedEvent extends common_lib_1.Events.Event {
    constructor(block) {
        super('blockRemoved');
        this.block = block;
    }
}
exports.BlockRemovedEvent = BlockRemovedEvent;
class ConnectionAddedEvent extends common_lib_1.Events.Event {
    constructor(connection) {
        super('connectionAdded');
        this.connection = connection;
    }
}
exports.ConnectionAddedEvent = ConnectionAddedEvent;
class ConnectionRemovedEvent extends common_lib_1.Events.Event {
    constructor(connection) {
        super('connectionRemoved');
        this.connection = connection;
    }
}
exports.ConnectionRemovedEvent = ConnectionRemovedEvent;
class ConnectorAddedEvent extends common_lib_1.Events.Event {
    constructor(connector) {
        super('connectorAdded');
        this.connector = connector;
    }
}
exports.ConnectorAddedEvent = ConnectorAddedEvent;
class ConnectorRemovedEvent extends common_lib_1.Events.Event {
    constructor(connector) {
        super('connectorRemoved');
        this.connector = connector;
    }
}
exports.ConnectorRemovedEvent = ConnectorRemovedEvent;
class IOEvent extends common_lib_1.Events.Event {
    constructor() {
        super('io');
    }
}
exports.IOEvent = IOEvent;
class DestroyEvent extends common_lib_1.Events.Event {
    constructor() {
        super('destroy');
    }
}
exports.DestroyEvent = DestroyEvent;
class RuntimeErrorEvent extends common_lib_1.Events.Event {
    constructor() {
        super('runtimeError');
    }
}
exports.RuntimeErrorEvent = RuntimeErrorEvent;
class BindInterfaceEvent extends common_lib_1.Events.Event {
    constructor() {
        super('bindInterface');
    }
}
exports.BindInterfaceEvent = BindInterfaceEvent;
class ConfigPropertyAddedEvent extends common_lib_1.Events.Event {
    constructor(configProperty) {
        super('configPropertyAdded');
        this.configProperty = configProperty;
    }
}
exports.ConfigPropertyAddedEvent = ConfigPropertyAddedEvent;
class ConfigPropertyRemovedEvent extends common_lib_1.Events.Event {
    constructor(configProperty) {
        super('configPropertyRemoved');
        this.configProperty = configProperty;
    }
}
exports.ConfigPropertyRemovedEvent = ConfigPropertyRemovedEvent;
class DataChangedEvent extends common_lib_1.Events.Event {
    constructor() {
        super('dataChanged');
    }
}
exports.DataChangedEvent = DataChangedEvent;
