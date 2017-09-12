"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Connector_1 = require("./Connector");
const ExternalConnector_1 = require("./ExternalConnector");
const ConfigProperty_1 = require("./ConfigProperty");
const Size_1 = require("./Size");
const common_lib_1 = require("common-lib");
class Block {
    constructor(id, type, visualType) {
        this._typeOfBlock = null;
        this._blockVersion = null;
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
        if (value == this._x)
            return;
        this._x = value;
    }
    get y() {
        return this._y;
    }
    set y(value) {
        if (value == this._y)
            return;
        this._y = value;
    }
    sendValueToOutputConnector(connector, value) {
        if (!this.controller || (this.controller && !this.controller.configuration.outputEnabled))
            return;
        if (this.outputConnectors.indexOf(connector) != -1) {
            connector._outputSetValue(value);
        }
        else {
            console.log("Connector named " + connector.name + " is not output connector on block " + this.id);
        }
    }
    addOutputConnector(name, type, displayName = null, argTypes = null) {
        if (type == common_lib_1.Types.ConnectorType.DigitalOutput || type == common_lib_1.Types.ConnectorType.AnalogOutput || type == common_lib_1.Types.ConnectorType.MessageOutput) {
            var connector = new Connector_1.Connector(this, name, displayName, type, argTypes);
            this.outputConnectors.push(connector);
            return connector;
        }
        console.log("Cannot add connector with type " + type + " as output connector.");
        return null;
    }
    addInputConnector(name, type, displayName = null, argTypes = null) {
        if (type == common_lib_1.Types.ConnectorType.DigitalInput || type == common_lib_1.Types.ConnectorType.AnalogInput || type == common_lib_1.Types.ConnectorType.MessageInput) {
            var connector = new Connector_1.Connector(this, name, displayName, type, argTypes);
            this.inputConnectors.push(connector);
            return connector;
        }
        console.log("Cannot add connector with type " + type + " as input connector.");
        return null;
    }
    removeOutputConnector(connector) {
        if (!connector)
            return;
        this.disconnectConnectionFromConnector(connector);
        var index = this.outputConnectors.indexOf(connector);
        if (index > -1) {
            this.outputConnectors.splice(index, 1);
        }
    }
    removeInputConnector(connector) {
        if (!connector)
            return;
        this.disconnectConnectionFromConnector(connector);
        var index = this.inputConnectors.indexOf(connector);
        if (index > -1) {
            this.inputConnectors.splice(index, 1);
        }
    }
    addExternalInputConnector(targetId, name, targetType, type, argTypes = null) {
        if (type == common_lib_1.Types.ConnectorType.DigitalInput) {
            var connector = new ExternalConnector_1.ExternalDigitalConnector(this, targetId, name, targetType, ExternalConnector_1.ExternalConnectorType.Input);
            this.externalInputConnectors.push(connector);
            return connector;
        }
        if (type == common_lib_1.Types.ConnectorType.AnalogInput) {
            var connector = new ExternalConnector_1.ExternalAnalogConnector(this, targetId, name, targetType, ExternalConnector_1.ExternalConnectorType.Input);
            this.externalInputConnectors.push(connector);
            return connector;
        }
        if (type == common_lib_1.Types.ConnectorType.MessageInput) {
            var connector = new ExternalConnector_1.ExternalMessageConnector(this, targetId, name, targetType, ExternalConnector_1.ExternalConnectorType.Input, argTypes);
            this.externalInputConnectors.push(connector);
            return connector;
        }
        console.log("Cannot add connector with type " + type + " as external input connector.");
        return null;
    }
    addExternalOutputConnector(targetId, name, targetType, type, argTypes = null) {
        if (type == common_lib_1.Types.ConnectorType.DigitalOutput) {
            var connector = new ExternalConnector_1.ExternalDigitalConnector(this, targetId, name, targetType, ExternalConnector_1.ExternalConnectorType.Output);
            this.externalOutputsConnectors.push(connector);
            return connector;
        }
        if (type == common_lib_1.Types.ConnectorType.AnalogOutput) {
            var connector = new ExternalConnector_1.ExternalAnalogConnector(this, targetId, name, targetType, ExternalConnector_1.ExternalConnectorType.Output);
            this.externalOutputsConnectors.push(connector);
            return connector;
        }
        if (type == common_lib_1.Types.ConnectorType.MessageOutput) {
            var connector = new ExternalConnector_1.ExternalMessageConnector(this, targetId, name, targetType, ExternalConnector_1.ExternalConnectorType.Output, argTypes);
            this.externalOutputsConnectors.push(connector);
            return connector;
        }
        console.log("Cannot add connector with type " + type + " as external output connector.");
        return null;
    }
    removeExternalInputConnector(connector) {
        if (!connector)
            return;
        var index = this.externalInputConnectors.indexOf(connector);
        if (index > -1) {
            this.externalInputConnectors.splice(index, 1);
        }
    }
    removeExternalOutputConnector(connector) {
        if (!connector)
            return;
        var index = this.externalOutputsConnectors.indexOf(connector);
        if (index > -1) {
            this.externalOutputsConnectors.splice(index, 1);
        }
    }
    addConfigProperty(type, id, displayName, defaultValue, config) {
        var configProperty = new ConfigProperty_1.ConfigProperty(type, id, displayName, defaultValue, config);
        this.configProperties.push(configProperty);
        return configProperty;
    }
    getConfigProperties() {
        return this.configProperties;
    }
    removeConfigProperty(configProperty) {
        if (!configProperty)
            return;
        var index = this.configProperties.indexOf(configProperty);
        if (index > -1) {
            this.configProperties.splice(index, 1);
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
        if (this.renderer)
            this.renderer.refresh();
    }
    registerOutputEventCallback(callback) {
        this.outputEventCallbacks.push(callback);
    }
    _outputEvent(connector, eventType, value) {
        this.outputEventCallbacks.forEach(callback => callback(connector, eventType, value));
        if (this.controller.configuration.outputEnabled) {
            this.outputChanged(connector, eventType, value);
        }
        if (this.renderer)
            this.renderer.refresh();
    }
    outputChanged(connector, eventType, value) {
        connector.connections.forEach(connection => {
            var cOther = connection.getOtherConnector(connector);
            cOther._inputSetValue(value);
        });
    }
    registerInputEventCallback(callback) {
        this.inputEventCallbacks.push(callback);
    }
    _inputEvent(connector, eventType, value) {
        this.inputEventCallbacks.forEach(callback => callback(connector, eventType, value));
        if (this.controller.configuration.inputEnabled) {
            this.inputChanged(connector, eventType, value);
        }
        if (this.renderer)
            this.renderer.refresh();
    }
    inputChanged(connector, eventType, value) {
    }
    registerExternalOutputEventCallback(callback) {
        this.externalOutputEventCallbacks.push(callback);
    }
    _externalOutputEvent(connector, eventType, value) {
        this.externalOutputEventCallbacks.forEach(callback => callback(connector, eventType, value));
        this.externalOutputEvent(connector, eventType, value);
        if (this.renderer)
            this.renderer.refresh();
    }
    externalOutputEvent(connector, eventType, value) {
    }
    registerExternalInputEventCallback(callback) {
        this.externalInputEventCallbacks.push(callback);
    }
    _externalInputEvent(connector, eventType, value) {
        this.externalInputEventCallbacks.forEach(callback => callback(connector, eventType, value));
        this.externalInputEvent(connector, eventType, value);
        if (this.renderer)
            this.renderer.refresh();
    }
    externalInputEvent(connector, eventType, value) {
    }
    registerConfigChangedCallback(callback) {
        this.configChangedCallbacks.push(callback);
    }
    emitConfigChanged() {
        this.configChanged();
        this.configChangedCallbacks.forEach(callback => callback());
    }
    getConfigData() {
        var config = {};
        this.configProperties.forEach((configProperty) => {
            config[configProperty.name] = configProperty.value;
        });
        return config;
    }
    getConfigPropertyByName(name) {
        var cp = null;
        this.configProperties.forEach((configProperty) => {
            if (configProperty.name == name) {
                cp = configProperty;
            }
        });
        return cp;
    }
    setConfigData(json) {
        for (var key in json) {
            if (json.hasOwnProperty(key)) {
                var cp = this.getConfigPropertyByName(key);
                if (cp) {
                    cp.value = json[key];
                }
            }
        }
        this.emitConfigChanged();
    }
    disconnectConnectionFromConnector(connector) {
        var toDisconnect = connector.connections.splice(0);
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
        if (this.renderer)
            this.renderer.destroy();
        if (this.controller) {
            this.controller._removeBlock(this);
        }
    }
    getOutputConnectorByName(name) {
        var connector = null;
        this.outputConnectors.forEach((c) => {
            if (c.name == name) {
                connector = c;
            }
        });
        return connector;
    }
    getInputConnectorByName(name) {
        var connector = null;
        this.inputConnectors.forEach((c) => {
            if (c.name == name) {
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
    rendererGetBlockBackgroundColor() {
        return "#ccc";
    }
    rendererGetDisplayName() {
        return this.visualType;
    }
    rendererGetBlockName() {
        return this.id;
    }
    rendererGetDisplayNameCursor() {
        return "move";
    }
    rendererGetBlockSize() {
        var maxCon = Math.max(this.inputConnectors.length, this.outputConnectors.length);
        var height = Math.max(69, 69 + ((maxCon - 2) * 20));
        return new Size_1.Size(59, height);
    }
    rendererCanDelete() {
        return true;
    }
    rendererShowBlockName() {
        return true;
    }
    rendererRotateDisplayName() {
        return 0;
    }
    rendererCustomSvgPath(size) {
        return null;
    }
    rendererGetBlockDescription() {
        return null;
    }
    rendererGetCodeName() {
        return "";
    }
    get typeOfBlock() {
        return this._typeOfBlock;
    }
    get blockVersion() {
        return this._blockVersion;
    }
    set blockVersion(version) {
        this._blockVersion = version;
    }
}
exports.Block = Block;
