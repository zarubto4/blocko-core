"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Connector_1 = require("./Connector");
const ExternalConnector_1 = require("./ExternalConnector");
const ConfigProperty_1 = require("./ConfigProperty");
const Message_1 = require("./Message");
const common_lib_1 = require("common-lib");
class Block {
    constructor(id, type, visualType) {
        this._blockId = null;
        this._versionId = null;
        this._color = null;
        this.configPropertiesDescription = null;
        this._controller = null;
        this._x = 0;
        this._y = 0;
        this._codeBlock = false;
        this.initializationCallbacks = [];
        this.outputEventCallbacks = [];
        this.inputEventCallbacks = [];
        this.externalOutputEventCallbacks = [];
        this.externalInputEventCallbacks = [];
        this.configChangedCallbacks = [];
        this.id = id;
        this.type = type;
        this.visualType = visualType;
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
    afterControllerSet() { }
    get codeBlock() {
        return this._codeBlock;
    }
    get x() {
        return this._x;
    }
    set x(value) {
        if (value !== this._x) {
            this._x = value;
        }
    }
    get y() {
        return this._y;
    }
    set y(value) {
        if (value !== this._y) {
            this._y = value;
        }
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
        return connector;
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
        return connector;
    }
    removeOutputConnector(connector) {
        if (!connector)
            return;
        this.disconnectConnectionFromConnector(connector);
        let index = this.outputConnectors.indexOf(connector);
        if (index > -1) {
            this.outputConnectors.splice(index, 1);
        }
    }
    removeInputConnector(connector) {
        if (!connector)
            return;
        this.disconnectConnectionFromConnector(connector);
        let index = this.inputConnectors.indexOf(connector);
        if (index > -1) {
            this.inputConnectors.splice(index, 1);
        }
    }
    addExternalInputConnector(targetId, name, type, argTypes = null) {
        if (type == common_lib_1.Types.ConnectorType.DigitalInput) {
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
    addExternalOutputConnector(targetId, name, type, argTypes = null) {
        if (type == common_lib_1.Types.ConnectorType.DigitalOutput) {
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
    removeExternalInputConnector(connector) {
        if (connector) {
            let index = this.externalInputConnectors.indexOf(connector);
            if (index > -1) {
                this.externalInputConnectors.splice(index, 1);
            }
        }
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
        let configProperty = new ConfigProperty_1.ConfigProperty(type, id, displayName, defaultValue, this.emitConfigChanged.bind(this), config);
        this.configProperties.push(configProperty);
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
            }
        }
    }
    getInputConnectors() {
        return this.inputConnectors;
    }
    getOutputConnectors() {
        return this.outputConnectors;
    }
    getExternalInputConnectors() {
        return this.externalInputConnectors;
    }
    getExternalOutputConnectors() {
        return this.externalOutputsConnectors;
    }
    registerInitializationCallback(callback) {
        this.initializationCallbacks.push(callback);
    }
    initialize() {
        this.initializationCallbacks.forEach(callback => callback());
        if (this.renderer) {
            this.renderer.refresh();
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
        if (this.renderer) {
            this.renderer.refresh();
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
        if (this.renderer) {
            this.renderer.refresh();
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
        if (this.renderer) {
            this.renderer.refresh();
        }
    }
    externalOutputEvent(event) {
    }
    registerExternalInputEventCallback(callback) {
        this.externalInputEventCallbacks.push(callback);
    }
    _externalInputEvent(event) {
        this.externalInputEventCallbacks.forEach(callback => callback(event.connector, event.eventType, event.value));
        this.externalInputEvent(event);
        if (this.renderer) {
            this.renderer.refresh();
        }
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
        if (this.renderer) {
            this.renderer.destroy();
        }
        if (this.controller) {
            this.controller._removeBlock(this);
        }
    }
    getOutputConnectorById(id) {
        let connector = null;
        this.outputConnectors.forEach((c) => {
            if (c.id == id) {
                connector = c;
            }
        });
        return connector;
    }
    getInputConnectorById(id) {
        let connector = null;
        this.inputConnectors.forEach((c) => {
            if (c.id == id) {
                connector = c;
            }
        });
        return connector;
    }
    configChanged() {
    }
    onMouseDrag(event) { return false; }
    onMouseClick() { }
    onMouseDown() { }
    onMouseUp() { }
    isInterface() {
        return false;
    }
    rendererGetDisplayName() {
        return this.visualType;
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
    get blockId() {
        return this._blockId;
    }
    get versionId() {
        return this._versionId;
    }
    set versionId(version) {
        this._versionId = version;
    }
}
exports.Block = Block;
