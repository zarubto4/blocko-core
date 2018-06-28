"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Connector_1 = require("./Connector");
const ExternalConnector_1 = require("./ExternalConnector");
const ConfigProperty_1 = require("./ConfigProperty");
const Message_1 = require("./Message");
const common_lib_1 = require("common-lib");
const Events_1 = require("./Events");
class Block extends common_lib_1.Events.Emitter {
    constructor(id, type) {
        super();
        this._controller = null;
        this.configPropertiesDescription = null;
        this._codeBlock = false;
        this.outputEventCallbacks = [];
        this.inputEventCallbacks = [];
        this.externalOutputEventCallbacks = [];
        this.externalInputEventCallbacks = [];
        this.configChangedCallbacks = [];
        this.id = id;
        this.type = type;
        this._data = {};
        this.inputConnectors = [];
        this.outputConnectors = [];
        this.externalInputConnectors = [];
        this.externalOutputsConnectors = [];
        this.configProperties = [];
    }
    get controller() {
        return this._controller;
    }
    set controller(controller) {
        if (!this._controller) {
            this._controller = controller;
            this.afterControllerSet();
        }
    }
    get data() {
        return this._data;
    }
    afterControllerSet() { }
    getDataJson() {
        let data = {
            id: this.id,
            type: this.type,
            name: this.name,
            description: this.description,
            config: this.getConfigData(),
            data: this._data,
            outputs: {}
        };
        this.outputConnectors.forEach((connector) => {
            let connectionsJson = [];
            connector.connections.forEach((connection) => {
                let otherConnector = connection.getOtherConnector(connector);
                connectionsJson.push({
                    'block': otherConnector.block.id,
                    'connector': otherConnector.id
                });
            });
            data['outputs'][connector.id] = connectionsJson;
        });
        return data;
    }
    setDataJson(data) {
        if (data['id']) {
            this.id = data['id'];
        }
        if (data['name']) {
            this.name = data['name'];
        }
        if (data['description']) {
            this.description = data['description'];
        }
        if (data['data']) {
            this._data = data['data'];
        }
    }
    get codeBlock() {
        return this._codeBlock;
    }
    sendValueToOutputConnector(event) {
        if (!this.controller || (this.controller && !this.controller.configuration.outputEnabled)) {
            return;
        }
        if (this.outputConnectors.indexOf(event.connector) !== -1) {
            event.connector._outputSetValue(event.value, event.interfaceId);
        }
        else {
            console.warn('Connector named ' + event.connector.id + ' is not output connector on block ' + this.id);
        }
    }
    addInputConnector(id, type, name = null, argTypes = null) {
        let connector;
        switch (type) {
            case common_lib_1.Types.ConnectorType.DigitalInput: {
                connector = new Connector_1.DigitalConnector(this, id, name, type);
                break;
            }
            case common_lib_1.Types.ConnectorType.AnalogInput: {
                connector = new Connector_1.AnalogConnector(this, id, name, type);
                break;
            }
            case common_lib_1.Types.ConnectorType.MessageInput: {
                connector = new Connector_1.MessageConnector(this, id, name, type, argTypes);
                break;
            }
            case common_lib_1.Types.ConnectorType.JsonInput: {
                connector = new Connector_1.JsonConnector(this, id, name, type);
                break;
            }
            default: {
                console.error('Block::addInputConnector - cannot add connector with type ' + type + ' as input connector.');
                return null;
            }
        }
        this.inputConnectors.push(connector);
        this.emit(this, new Events_1.ConnectorAddedEvent(connector));
        return connector;
    }
    getInputConnectors() {
        return this.inputConnectors;
    }
    removeInputConnector(connector) {
        if (connector) {
            this.disconnectConnectionFromConnector(connector);
            let index = this.inputConnectors.indexOf(connector);
            if (index > -1) {
                this.inputConnectors.splice(index, 1);
                this.emit(this, new Events_1.ConnectorRemovedEvent(connector));
            }
        }
    }
    addOutputConnector(id, type, name = null, argTypes = null) {
        let connector;
        switch (type) {
            case common_lib_1.Types.ConnectorType.DigitalOutput: {
                connector = new Connector_1.DigitalConnector(this, id, name, type);
                break;
            }
            case common_lib_1.Types.ConnectorType.AnalogOutput: {
                connector = new Connector_1.AnalogConnector(this, id, name, type);
                break;
            }
            case common_lib_1.Types.ConnectorType.MessageOutput: {
                connector = new Connector_1.MessageConnector(this, id, name, type, argTypes);
                break;
            }
            case common_lib_1.Types.ConnectorType.JsonOutput: {
                connector = new Connector_1.JsonConnector(this, id, name, type);
                break;
            }
            default: {
                console.error('Block::addOutputConnector - cannot add connector with type ' + type + ' as output connector.');
                return null;
            }
        }
        this.outputConnectors.push(connector);
        this.emit(this, new Events_1.ConnectorAddedEvent(connector));
        return connector;
    }
    getOutputConnectors() {
        return this.outputConnectors;
    }
    removeOutputConnector(connector) {
        if (connector) {
            this.disconnectConnectionFromConnector(connector);
            let index = this.outputConnectors.indexOf(connector);
            if (index > -1) {
                this.outputConnectors.splice(index, 1);
                this.emit(this, new Events_1.ConnectorRemovedEvent(connector));
            }
        }
    }
    addExternalInputConnector(targetId, name, type, argTypes = null) {
        if (type === common_lib_1.Types.ConnectorType.DigitalInput) {
            let connector = new ExternalConnector_1.ExternalDigitalConnector(this, targetId, name, ExternalConnector_1.ExternalConnectorType.Input);
            this.externalInputConnectors.push(connector);
            return connector;
        }
        if (type === common_lib_1.Types.ConnectorType.AnalogInput) {
            let connector = new ExternalConnector_1.ExternalAnalogConnector(this, targetId, name, ExternalConnector_1.ExternalConnectorType.Input);
            this.externalInputConnectors.push(connector);
            return connector;
        }
        if (type === common_lib_1.Types.ConnectorType.MessageInput) {
            let connector = new ExternalConnector_1.ExternalMessageConnector(this, targetId, name, ExternalConnector_1.ExternalConnectorType.Input, argTypes);
            this.externalInputConnectors.push(connector);
            return connector;
        }
        console.warn('Cannot add connector with type ' + type + ' as external input connector.');
        return null;
    }
    getExternalInputConnectors() {
        return this.externalInputConnectors;
    }
    removeExternalInputConnector(connector) {
        if (connector) {
            let index = this.externalInputConnectors.indexOf(connector);
            if (index > -1) {
                this.externalInputConnectors.splice(index, 1);
            }
        }
    }
    addExternalOutputConnector(targetId, name, type, argTypes = null) {
        if (type === common_lib_1.Types.ConnectorType.DigitalOutput) {
            let connector = new ExternalConnector_1.ExternalDigitalConnector(this, targetId, name, ExternalConnector_1.ExternalConnectorType.Output);
            this.externalOutputsConnectors.push(connector);
            return connector;
        }
        if (type === common_lib_1.Types.ConnectorType.AnalogOutput) {
            let connector = new ExternalConnector_1.ExternalAnalogConnector(this, targetId, name, ExternalConnector_1.ExternalConnectorType.Output);
            this.externalOutputsConnectors.push(connector);
            return connector;
        }
        if (type === common_lib_1.Types.ConnectorType.MessageOutput) {
            let connector = new ExternalConnector_1.ExternalMessageConnector(this, targetId, name, ExternalConnector_1.ExternalConnectorType.Output, argTypes);
            this.externalOutputsConnectors.push(connector);
            return connector;
        }
        console.warn('Cannot add connector with type ' + type + ' as external output connector.');
        return null;
    }
    getExternalOutputConnectors() {
        return this.externalOutputsConnectors;
    }
    removeExternalOutputConnector(connector) {
        if (connector) {
            let index = this.externalOutputsConnectors.indexOf(connector);
            if (index > -1) {
                this.externalOutputsConnectors.splice(index, 1);
            }
        }
    }
    addConfigProperty(type, id, displayName, defaultValue, config) {
        let configProperty = new ConfigProperty_1.ConfigProperty(type, id, displayName, defaultValue, config);
        this.configProperties.push(configProperty);
        configProperty.listenEvent('dataChanged', (e) => {
            this.emitConfigChanged();
        });
        this.emit(this, new Events_1.ConfigPropertyAddedEvent(configProperty));
        return configProperty;
    }
    getConfigProperties() {
        return this.configProperties;
    }
    removeConfigProperty(configProperty) {
        if (configProperty) {
            let index = this.configProperties.indexOf(configProperty);
            if (index > -1) {
                this.configProperties.splice(index, 1);
                this.emit(this, new Events_1.ConfigPropertyRemovedEvent(configProperty));
            }
        }
    }
    registerOutputEventCallback(callback) {
        this.outputEventCallbacks.push(callback);
    }
    _outputEvent(event) {
        this.outputEventCallbacks.forEach(callback => callback(event.connector, event.eventType, event.value instanceof Message_1.Message ? event.value.toJson() : event.value));
        if (this.controller.configuration.outputEnabled) {
            this.outputChanged(event);
        }
    }
    outputChanged(event) {
        event.connector.connections.forEach(connection => {
            let cOther = connection.getOtherConnector(event.connector);
            cOther._inputSetValue(event.value, event.interfaceId);
        });
    }
    registerInputEventCallback(callback) {
        this.inputEventCallbacks.push(callback);
    }
    _inputEvent(event) {
        this.inputEventCallbacks.forEach(callback => callback(event.connector, event.eventType, event.value instanceof Message_1.Message ? event.value.toJson() : event.value));
        if (this.controller.configuration.inputEnabled) {
            this.inputChanged(event);
        }
    }
    inputChanged(event) {
    }
    registerExternalOutputEventCallback(callback) {
        this.externalOutputEventCallbacks.push(callback);
    }
    _externalOutputEvent(event) {
        this.externalOutputEventCallbacks.forEach(callback => callback(event.connector, event.eventType, event.value));
        this.externalOutputEvent(event);
    }
    externalOutputEvent(event) {
    }
    registerExternalInputEventCallback(callback) {
        this.externalInputEventCallbacks.push(callback);
    }
    _externalInputEvent(event) {
        this.externalInputEventCallbacks.forEach(callback => callback(event.connector, event.eventType, event.value));
        this.externalInputEvent(event);
    }
    externalInputEvent(event) {
    }
    registerConfigChangedCallback(callback) {
        this.configChangedCallbacks.push(callback);
    }
    emitConfigChanged() {
        this.configChanged();
        this.configChangedCallbacks.forEach(callback => callback());
    }
    getConfigData() {
        let config = {};
        this.configProperties.forEach((configProperty) => {
            config[configProperty.name] = configProperty.value;
        });
        return config;
    }
    getConfigPropertyByName(name) {
        let cp = null;
        this.configProperties.forEach((configProperty) => {
            if (configProperty.name === name) {
                cp = configProperty;
            }
        });
        return cp;
    }
    setConfigData(json) {
        for (let key in json) {
            if (json.hasOwnProperty(key)) {
                let cp = this.getConfigPropertyByName(key);
                if (cp) {
                    cp.value = json[key];
                }
            }
        }
        this.emitConfigChanged();
    }
    disconnectConnectionFromConnector(connector) {
        let toDisconnect = connector.connections.splice(0);
        toDisconnect.forEach((connection) => {
            connection.disconnect();
        });
    }
    remove() {
        this.inputConnectors.forEach((connector) => {
            this.disconnectConnectionFromConnector(connector);
        });
        this.outputConnectors.forEach((connector) => {
            this.disconnectConnectionFromConnector(connector);
        });
        this.emit(this, new Events_1.DestroyEvent());
        if (this.controller) {
            this.controller._removeBlock(this);
        }
    }
    getOutputConnectorById(id) {
        let connector = null;
        this.outputConnectors.forEach((c) => {
            if (c.id === id) {
                connector = c;
            }
        });
        return connector;
    }
    getInputConnectorById(id) {
        let connector = null;
        this.inputConnectors.forEach((c) => {
            if (c.id === id) {
                connector = c;
            }
        });
        return connector;
    }
    configChanged() {
    }
    isInterface() {
        return false;
    }
    rendererGetBlockName() {
        return this.id;
    }
    rendererGetCodeName() {
        return '';
    }
    rendererIsHwAttached() {
        return false;
    }
}
exports.Block = Block;
