"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_lib_1 = require("common-lib");
const TSBlockError_1 = require("../TSBlock/TSBlockError");
const Message_1 = require("../../Core/Message");
const Connector_1 = require("../../Core/Connector");
class ValueChangedEvent extends common_lib_1.Events.Event {
    constructor(value) {
        super('valueChanged');
        this.value = value;
    }
    ;
}
exports.ValueChangedEvent = ValueChangedEvent;
class ConfigValueChangedEvent extends common_lib_1.Events.Event {
    constructor(value) {
        super('valueChanged');
        this.value = value;
    }
    ;
}
exports.ConfigValueChangedEvent = ConfigValueChangedEvent;
class MessageReceivedEvent extends common_lib_1.Events.Event {
    constructor(message) {
        super('messageReceived');
        this.message = message;
    }
    ;
}
exports.MessageReceivedEvent = MessageReceivedEvent;
class GroupInputEvent extends common_lib_1.Events.Event {
    constructor(value, interfaceId) {
        super('groupInput');
        this.value = value;
        this.interfaceId = interfaceId;
    }
    ;
}
exports.GroupInputEvent = GroupInputEvent;
class ReadyEvent extends common_lib_1.Events.Event {
    constructor() {
        super('ready');
    }
    ;
}
exports.ReadyEvent = ReadyEvent;
class DestroyEvent extends common_lib_1.Events.Event {
    constructor() {
        super('destroy');
    }
    ;
}
exports.DestroyEvent = DestroyEvent;
class BaseConnector extends common_lib_1.Events.Emitter {
    constructor(connector, tsBlockLib) {
        super();
        this.connector = connector;
        this.tsBlockLib = tsBlockLib;
    }
    get name() {
        return this.connector.id;
    }
    get displayName() {
        return this.connector.name;
    }
    get type() {
        return common_lib_1.Types.getStringsFromConnectorType(this.connector.type).type;
    }
    get direction() {
        return common_lib_1.Types.getStringsFromConnectorType(this.connector.type).direction;
    }
    get lastMessage() {
        if (this.connector.isMessage() && this.connector.lastMessage) {
            return {
                types: this.connector.lastMessage.argTypes.map((at) => common_lib_1.Types.TypeToStringTable[at]),
                values: this.connector.lastMessage.values
            };
        }
        return null;
    }
    get messageTypes() {
        if (this.connector.isMessage() && this.connector.argTypes) {
            return this.connector.argTypes.map((at) => common_lib_1.Types.TypeToStringTable[at]);
        }
        return null;
    }
}
exports.BaseConnector = BaseConnector;
class InputConnector extends BaseConnector {
    get value() {
        return this.connector.value;
    }
}
exports.InputConnector = InputConnector;
class OutputConnector extends BaseConnector {
    get value() {
        return this.connector.value;
    }
    set value(value) {
        if (typeof value === 'boolean' || typeof value === 'number') {
            this.tsBlockLib.sendValueToOutputConnector(this.connector, value);
        }
        else {
            throw new TSBlockError_1.TSBlockError('Attempt to set wrong value on a connector. The type of value must be \'boolean\' or \'number\', but got \'' + typeof value + '\'');
        }
    }
    send(message) {
        if (Array.isArray(message)) {
            this.tsBlockLib.sendValueToOutputConnector(this.connector, message);
        }
        else {
            throw new TSBlockError_1.TSBlockError('Attempt to send invalid data. Message must be an array, but got \'' + typeof message + '\'');
        }
    }
    groupOutput(value, interfaceId) {
        this.tsBlockLib.sendValueToOutputConnector(this.connector, value, interfaceId);
    }
}
exports.OutputConnector = OutputConnector;
class ConfigPropertyWrapper extends common_lib_1.Events.Emitter {
    constructor(configProperty, tsBlockLib) {
        super();
        this.configProperty = configProperty;
        this.tsBlockLib = tsBlockLib;
    }
    get value() {
        return this.configProperty.value;
    }
    get name() {
        return this.configProperty.name;
    }
    get displayName() {
        return this.configProperty.displayName;
    }
    get type() {
        return common_lib_1.Types.ConfigPropertyTypeToStringTable[this.configProperty.type];
    }
}
exports.ConfigPropertyWrapper = ConfigPropertyWrapper;
class TSBlockLib {
    constructor(tsBlock) {
        this.tsBlock = tsBlock;
        this.usedInputOutputNames = [];
        this.inputConnectors = {};
        this.outputConnectors = {};
        this.configPropertiesConnectors = {};
        this.inputConnectorsEmitter = new common_lib_1.Events.Emitter();
        this.outputConnectorsEmitter = new common_lib_1.Events.Emitter();
        this.configPropertiesConnectorsEmitter = new common_lib_1.Events.Emitter();
        this.contextEmitter = new common_lib_1.Events.Emitter();
        this.machine = null;
    }
    get name() {
        return TSBlockLib.libName;
    }
    init() {
        return null;
    }
    clean() {
        this.usedInputOutputNames = [];
        this.inputConnectors = {};
        this.outputConnectors = {};
        this.configPropertiesConnectors = {};
        this.inputConnectorsEmitter = new common_lib_1.Events.Emitter();
        this.outputConnectorsEmitter = new common_lib_1.Events.Emitter();
        this.configPropertiesConnectorsEmitter = new common_lib_1.Events.Emitter();
        this.contextEmitter = new common_lib_1.Events.Emitter();
    }
    nameValidator(name, method) {
        if (typeof name !== 'string' || name === '') {
            throw new TSBlockError_1.TSBlockError(`In <b>${method}</b>: input/output name must be string and cannot be empty`);
        }
        if (!(/^[A-Za-z0-9]+$/.test(name))) {
            throw new TSBlockError_1.TSBlockError(`In <b>${method}</b>: input/output name <b>${name}</b> is not valid, you can use only A-Z, a-z and 0-9 characters`);
        }
        if (this.usedInputOutputNames.indexOf(name.toLowerCase()) !== -1) {
            throw new TSBlockError_1.TSBlockError(`In <b>${method}</b>: duplicate using of name <b>${name}</b>`);
        }
    }
    ;
    argTypesValidator(argTypes, method) {
        if (!Array.isArray(argTypes)) {
            throw new TSBlockError_1.TSBlockError(`In <b>${method}</b>: message types parameter must be array`);
        }
        if (argTypes.length === 0) {
            throw new TSBlockError_1.TSBlockError(`In <b>${method}</b>: message types parameter must contain at least 1 type`);
        }
        if (argTypes.length > 8) {
            throw new TSBlockError_1.TSBlockError(`In <b>${method}</b>: message types parameter must contain maximal 8 type`);
        }
        argTypes.forEach((argType) => {
            if ((argType !== common_lib_1.Types.TypeToStringTable[common_lib_1.Types.Type.Boolean]) &&
                (argType !== common_lib_1.Types.TypeToStringTable[common_lib_1.Types.Type.Float]) &&
                (argType !== common_lib_1.Types.TypeToStringTable[common_lib_1.Types.Type.Integer]) &&
                (argType !== common_lib_1.Types.TypeToStringTable[common_lib_1.Types.Type.String])) {
                throw new TSBlockError_1.TSBlockError(`In <b>${method}</b>: message types parameter can contain only types: <b>'boolean'</b>, <b>'integer'</b>, <b>'float'</b>, <b>'string'</b>).`);
            }
        });
    }
    ;
    getInputOutputType(type, direction, method) {
        let ct = common_lib_1.Types.getConnectorTypeFromStrings(type, direction);
        if (ct) {
            return ct;
        }
        throw new TSBlockError_1.TSBlockError(`In <b>${method}</b>: unknown ${direction} type <b>${type}</b>`);
    }
    getConfigPropertyType(type, method) {
        let t = common_lib_1.Types.StringToConfigPropertyTypeTable[type];
        if (t) {
            return t;
        }
        throw new TSBlockError_1.TSBlockError(`In <b>${method}</b>: unknown config property type <b>${type}</b>`);
    }
    sendValueToOutputConnector(connector, value, interfaceId) {
        this.tsBlock.sendValueToOutputConnector({
            connector: connector,
            eventType: null,
            value: Array.isArray(value) ? new Message_1.Message(connector.argTypes.slice(0), value) : value,
            interfaceId: interfaceId
        });
        let strings = common_lib_1.Types.getStringsFromConnectorType(connector.type);
        let tsEvent;
        if (interfaceId) {
            tsEvent = new GroupInputEvent(strings.type !== 'message' ? value : {
                types: connector.argTypes.map((at) => common_lib_1.Types.TypeToStringTable[at]),
                values: value
            }, interfaceId);
        }
        else if (strings.type === 'message') {
            tsEvent = new MessageReceivedEvent({
                types: connector.argTypes.map((at) => common_lib_1.Types.TypeToStringTable[at]),
                values: value
            });
        }
        else {
            tsEvent = new ValueChangedEvent(value);
        }
        if (strings.direction === 'input') {
            let connectorWrapper = this.inputConnectors[connector.id];
            if (connectorWrapper && tsEvent) {
                this.inputConnectorsEmitter.emit(connectorWrapper, tsEvent);
                connectorWrapper.emit(connectorWrapper, tsEvent);
            }
        }
        else if (strings.direction === 'output') {
            let connectorWrapper = this.outputConnectors[connector.id];
            if (connectorWrapper && tsEvent) {
                this.outputConnectorsEmitter.emit(connectorWrapper, tsEvent);
                connectorWrapper.emit(connectorWrapper, tsEvent);
            }
        }
    }
    inputEvent(event) {
        if (this.machine) {
            this.machine.call(() => {
                let strings = common_lib_1.Types.getStringsFromConnectorType(event.connector.type);
                let tsEvent;
                if (event.eventType === Connector_1.ConnectorEventType.ValueChange) {
                    tsEvent = new ValueChangedEvent(event.value);
                }
                else if (event.eventType === Connector_1.ConnectorEventType.NewMessage) {
                    let message = event.value;
                    tsEvent = new MessageReceivedEvent({
                        types: message.argTypes.map((at) => common_lib_1.Types.TypeToStringTable[at]),
                        values: message.values
                    });
                }
                else if (event.eventType === Connector_1.ConnectorEventType.GroupInput) {
                    tsEvent = new GroupInputEvent(strings.type !== 'message' ? event.value : {
                        types: event.value.argTypes.map((at) => common_lib_1.Types.TypeToStringTable[at]),
                        values: event.value.values
                    }, event.interfaceId);
                }
                if (strings.direction === 'input') {
                    let connectorWrapper = this.inputConnectors[event.connector.id];
                    if (connectorWrapper && tsEvent) {
                        this.inputConnectorsEmitter.emit(connectorWrapper, tsEvent);
                        connectorWrapper.emit(connectorWrapper, tsEvent);
                    }
                }
                else if (strings.direction === 'output') {
                    let connectorWrapper = this.outputConnectors[event.connector.id];
                    if (connectorWrapper && tsEvent) {
                        this.outputConnectorsEmitter.emit(connectorWrapper, tsEvent);
                        connectorWrapper.emit(connectorWrapper, tsEvent);
                    }
                }
            });
        }
    }
    configChanged() {
        if (this.machine) {
            this.machine.call(() => {
                let out = {};
                this.tsBlock.getConfigProperties().forEach((cp) => {
                    out[cp.name] = cp.value;
                });
                this.configPropertiesConnectorsEmitter.emit(null, new ConfigValueChangedEvent(out));
                this.tsBlock.getConfigProperties().forEach((cp) => {
                    if (this.configPropertiesConnectors.hasOwnProperty(cp.name)) {
                        let configProperty = this.configPropertiesConnectors[cp.name];
                        configProperty.emit(configProperty, new ConfigValueChangedEvent(configProperty.value));
                    }
                });
            });
        }
    }
    callReady() {
        if (this.machine) {
            this.machine.call(() => {
                this.contextEmitter.emit(null, new ReadyEvent());
            });
        }
    }
    callDestroy() {
        if (this.machine) {
            this.machine.call(() => {
                this.contextEmitter.emit(null, new DestroyEvent());
            });
        }
    }
    external(machine) {
        this.machine = machine;
        let context = {
            services: {},
            listenEvent: (key, callback) => {
                return this.contextEmitter.listenEvent(key, callback);
            },
            removeListener: (listener) => {
                this.contextEmitter.removeListener(listener);
            },
            inputs: {
                add: (name, type, displayName, types) => {
                    if (!this.tsBlock.canAddsIO) {
                        throw new TSBlockError_1.TSBlockError(`You can add inputs only in first loop of your program`);
                    }
                    this.nameValidator(name, 'context.inputs.add');
                    let conType = this.getInputOutputType(type, 'input', 'context.inputs.add');
                    if (conType === common_lib_1.Types.ConnectorType.MessageInput) {
                        this.argTypesValidator(types, 'context.inputs.add');
                    }
                    if (types && Array.isArray(types)) {
                        types = types.map((t) => common_lib_1.Types.StringToTypeTable[t]);
                    }
                    this.usedInputOutputNames.push(name.toLowerCase());
                    let con = this.tsBlock.addInputConnector(name, conType, displayName, types);
                    let conWrapper = new InputConnector(con, this);
                    this.inputConnectors[name] = conWrapper;
                    return conWrapper;
                },
                get: (name) => {
                    if (this.inputConnectors.hasOwnProperty(name)) {
                        return this.inputConnectors[name];
                    }
                    return null;
                },
                listenEvent: (key, callback) => {
                    return this.inputConnectorsEmitter.listenEvent(key, callback);
                },
                removeListener: (listener) => {
                    this.inputConnectorsEmitter.removeListener(listener);
                },
            },
            outputs: {
                add: (name, type, displayName, types) => {
                    if (!this.tsBlock.canAddsIO) {
                        throw new TSBlockError_1.TSBlockError(`You can add outputs only in first loop of your program`);
                    }
                    this.nameValidator(name, 'context.outputs.add');
                    let conType = this.getInputOutputType(type, 'output', 'context.outputs.add');
                    if (conType === common_lib_1.Types.ConnectorType.MessageOutput) {
                        this.argTypesValidator(types, 'context.outputs.add');
                    }
                    if (types && Array.isArray(types)) {
                        types = types.map((t) => common_lib_1.Types.StringToTypeTable[t]);
                    }
                    this.usedInputOutputNames.push(name.toLowerCase());
                    let con = this.tsBlock.addOutputConnector(name, conType, displayName, types);
                    let conWrapper = new OutputConnector(con, this);
                    this.outputConnectors[name] = conWrapper;
                    return conWrapper;
                },
                get: (name) => {
                    if (this.outputConnectors.hasOwnProperty(name)) {
                        return this.outputConnectors[name];
                    }
                    return null;
                },
                listenEvent: (key, callback) => {
                    return this.outputConnectorsEmitter.listenEvent(key, callback);
                },
                removeListener: (listener) => {
                    this.outputConnectorsEmitter.removeListener(listener);
                },
            },
            configProperties: {
                add: (name, type, displayName, defaultValue, options) => {
                    if (!this.tsBlock.canAddsIO) {
                        throw new TSBlockError_1.TSBlockError(`You can add config properties only in first loop of your program`);
                    }
                    this.nameValidator(name, 'context.configProperties.add');
                    let cpType = this.getConfigPropertyType(type, 'context.configProperties.add');
                    this.usedInputOutputNames.push(name.toLowerCase());
                    let cp = this.tsBlock.addConfigProperty(cpType, name, displayName, defaultValue, options);
                    let cpWrapper = new ConfigPropertyWrapper(cp, this);
                    this.configPropertiesConnectors[name] = cpWrapper;
                    return cpWrapper;
                },
                get: (name) => {
                    if (this.outputConnectors.hasOwnProperty(name)) {
                        return this.outputConnectors[name];
                    }
                    return null;
                },
                listenEvent: (key, callback) => {
                    return this.configPropertiesConnectorsEmitter.listenEvent(key, callback);
                },
                removeListener: (listener) => {
                    this.configPropertiesConnectorsEmitter.removeListener(listener);
                },
            },
        };
        Object.defineProperty(context.configProperties, 'description', {
            set: (val) => {
                if (val) {
                    this.tsBlock.configPropertiesDescription = val.toString();
                }
                else {
                    this.tsBlock.configPropertiesDescription = null;
                }
            },
            get: () => {
                return this.tsBlock.configPropertiesDescription;
            }
        });
        Object.defineProperty(context, '__safeCall', {
            get: () => {
                return this.machine.call;
            }
        });
        return {
            context: context
        };
    }
}
TSBlockLib.libName = 'TSBlockLib';
TSBlockLib.libTypings = common_lib_1.Libs.ContextLibTypings + `
// BEGIN

// SERVICES

declare interface BlockServices {

}

declare interface BlockContext {

    /**
     * Backend services for block
     */
    readonly services: BlockServices;

    /**
     * Handler for construct, get and manage block config properties
     */
    readonly configProperties: ConfigPropertiesHandler;

    /**
     * Handler for construct, get and manage block inputs
     */
    readonly inputs: InputsHandler;

    /**
     * Handler for construct, get and manage block outputs
     */
    readonly outputs: OutputsHandler;

    /**
     * Adds event listener to block context
     * @param key Ready event
     * @param callback Callback with first param ContextReadyEvent object
     * @returns EventListener object, important for removing event listener
     */
    listenEvent(key: 'ready', callback: (event: ContextReadyEvent) => void): EventListener;

    /**
     * Adds event listener to block context
     * @param key Destroy event
     * @param callback Callback with first param ContextDestroyEvent object
     * @returns EventListener object, important for removing event listener
     */
    listenEvent(key: 'destroy', callback: (event: ContextDestroyEvent) => void): EventListener;

    /**
     * Remove event listener from block context
     * @param listener EventListener object to remove
     */
    removeListener(listener: EventListener): void;

}

declare const context: BlockContext;

// END
`;
exports.TSBlockLib = TSBlockLib;
