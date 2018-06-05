"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = require("./Message");
const Connection_1 = require("./Connection");
const common_lib_1 = require("common-lib");
const Renderer_1 = require("./Renderer");
var ConnectorEventType;
(function (ConnectorEventType) {
    ConnectorEventType[ConnectorEventType["ValueChange"] = 0] = "ValueChange";
    ConnectorEventType[ConnectorEventType["NewMessage"] = 1] = "NewMessage";
    ConnectorEventType[ConnectorEventType["GroupInput"] = 2] = "GroupInput";
})(ConnectorEventType = exports.ConnectorEventType || (exports.ConnectorEventType = {}));
class Connector {
    constructor(block, id, name, type) {
        this.connections = [];
        this.block = block;
        this.id = id;
        this.name = name;
        this.type = type;
    }
    get value() {
        return this._value;
    }
    set value(value) {
        this._value = value;
    }
    isOutput() {
        return this.type === common_lib_1.Types.ConnectorType.DigitalOutput || this.type === common_lib_1.Types.ConnectorType.AnalogOutput || this.type === common_lib_1.Types.ConnectorType.MessageOutput || this.type === common_lib_1.Types.ConnectorType.JsonOutput;
    }
    isInput() {
        return this.type === common_lib_1.Types.ConnectorType.DigitalInput || this.type === common_lib_1.Types.ConnectorType.AnalogInput || this.type === common_lib_1.Types.ConnectorType.MessageInput || this.type === common_lib_1.Types.ConnectorType.JsonInput;
    }
    isAnalog() {
        return false;
    }
    isDigital() {
        return false;
    }
    isMessage() {
        return false;
    }
    isJson() {
        return false;
    }
    haveFreeSpace() {
        if (this.type === common_lib_1.Types.ConnectorType.DigitalInput || this.type === common_lib_1.Types.ConnectorType.AnalogInput) {
            return (this.connections.length === 0);
        }
        return true;
    }
    connect(target) {
        if (this.canConnect(target)) {
            let connection = new Connection_1.Connection(this, target);
            this.connections.push(connection);
            target.connections.push(connection);
            if (this.block && this.block.controller) {
                this.block.controller._addConnection(connection);
            }
            return connection;
        }
        return null;
    }
    _removeConnection(connection) {
        let index = this.connections.indexOf(connection);
        if (index > -1) {
            this.connections.splice(index, 1);
        }
    }
    canConnect(target) {
        if (this.block === target.block) {
            return false;
        }
        if (!this.haveFreeSpace() || !target.haveFreeSpace()) {
            return false;
        }
        if (this.isInput() && target.isInput()) {
            return false;
        }
        if (this.isOutput() && target.isOutput()) {
            return false;
        }
        if (!((this.isAnalog() && target.isAnalog()) || (this.isDigital() && target.isDigital()) || (this.isMessage() && target.isMessage()) || (this.isJson() && target.isJson()))) {
            return false;
        }
        return true;
    }
    _outputSetValue(value, interfaceId) {
        if (this.isOutput()) {
            let type = ConnectorEventType.ValueChange;
            if (this.type === common_lib_1.Types.ConnectorType.MessageInput || this.type === common_lib_1.Types.ConnectorType.MessageOutput || this.type === common_lib_1.Types.ConnectorType.JsonInput || this.type === common_lib_1.Types.ConnectorType.JsonOutput) {
                type = ConnectorEventType.NewMessage;
            }
            if (interfaceId) {
                type = ConnectorEventType.GroupInput;
            }
            this._value = value;
            this.block._outputEvent({
                connector: this,
                eventType: type,
                value: value,
                interfaceId: interfaceId
            });
        }
        else {
            console.error('Connector::_outputSetValue - attempt to set input value on output connector');
        }
    }
    _inputSetValue(value, interfaceId) {
        if (this.isInput()) {
            let type = ConnectorEventType.ValueChange;
            if (this.type === common_lib_1.Types.ConnectorType.MessageInput || this.type === common_lib_1.Types.ConnectorType.MessageOutput || this.type === common_lib_1.Types.ConnectorType.JsonInput || this.type === common_lib_1.Types.ConnectorType.JsonOutput) {
                type = ConnectorEventType.NewMessage;
            }
            if (interfaceId) {
                type = ConnectorEventType.GroupInput;
            }
            this._value = value;
            this.block._inputEvent({
                connector: this,
                eventType: type,
                value: value,
                interfaceId: interfaceId
            });
        }
        else {
            console.error('Connector::_inputSetValue - attempt to set output value on input connector');
        }
    }
}
exports.Connector = Connector;
class DigitalConnector extends Connector {
    constructor(block, id, name, type) {
        super(block, id, name, type);
        this._value = false;
    }
    _outputSetValue(value, interfaceId) {
        if (typeof value === 'boolean') {
            super._outputSetValue(value, interfaceId);
        }
    }
    _inputSetValue(value, interfaceId) {
        if (typeof value === 'boolean') {
            super._inputSetValue(value, interfaceId);
        }
    }
    isDigital() {
        return true;
    }
}
exports.DigitalConnector = DigitalConnector;
class AnalogConnector extends Connector {
    constructor(block, id, name, type) {
        super(block, id, name, type);
        this._value = 0;
    }
    _outputSetValue(value, interfaceId) {
        if (typeof value === 'number') {
            super._outputSetValue(value, interfaceId);
        }
    }
    _inputSetValue(value, interfaceId) {
        if (typeof value === 'number') {
            super._inputSetValue(value, interfaceId);
        }
    }
    isAnalog() {
        return true;
    }
}
exports.AnalogConnector = AnalogConnector;
class MessageConnector extends Connector {
    constructor(block, id, name, type, argTypes) {
        super(block, id, name, type);
        this.argTypes = null;
        this.argTypes = argTypes;
        this._value = null;
    }
    _outputSetValue(value, interfaceId) {
        if (value instanceof Message_1.Message && value.isArgTypesEqual(this.argTypes)) {
            if (this.renderer) {
                this.renderer.highlight(Renderer_1.HighlightType.Message);
            }
            this.connections.forEach(connection => {
                if (connection.renderer) {
                    connection.renderer.highlight(Renderer_1.HighlightType.Message);
                }
            });
            super._outputSetValue(value, interfaceId);
        }
    }
    _inputSetValue(value, interfaceId) {
        if (value instanceof Message_1.Message && value.isArgTypesEqual(this.argTypes)) {
            if (this.renderer) {
                this.renderer.highlight(Renderer_1.HighlightType.Message);
            }
            this.connections.forEach(connection => {
                if (connection.renderer) {
                    connection.renderer.highlight(Renderer_1.HighlightType.Message);
                }
            });
            super._inputSetValue(value, interfaceId);
        }
    }
    isMessage() {
        return true;
    }
    canConnect(target) {
        return super.canConnect(target) && Message_1.MessageHelpers.isArgTypesEqual(this.argTypes, target.argTypes);
    }
    get stringArgTypes() {
        let out = [];
        if (this.argTypes) {
            this.argTypes.forEach((argType) => {
                out.push(common_lib_1.Types.TypeToStringTable[argType]);
            });
        }
        return out;
    }
}
exports.MessageConnector = MessageConnector;
class JsonConnector extends Connector {
    constructor(block, id, name, type) {
        super(block, id, name, type);
    }
    _outputSetValue(value, interfaceId) {
        if (typeof value === 'object') {
            if (this.renderer) {
                this.renderer.highlight(Renderer_1.HighlightType.Message);
            }
            this.connections.forEach(connection => {
                if (connection.renderer) {
                    connection.renderer.highlight(Renderer_1.HighlightType.Message);
                }
            });
            super._outputSetValue(value, interfaceId);
        }
    }
    _inputSetValue(value, interfaceId) {
        if (typeof value === 'object') {
            if (this.renderer) {
                this.renderer.highlight(Renderer_1.HighlightType.Message);
            }
            this.connections.forEach(connection => {
                if (connection.renderer) {
                    connection.renderer.highlight(Renderer_1.HighlightType.Message);
                }
            });
            super._inputSetValue(value, interfaceId);
        }
    }
    isJson() {
        return true;
    }
}
exports.JsonConnector = JsonConnector;
