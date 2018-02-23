"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Connection_1 = require("./Connection");
const Message_1 = require("./Message");
const common_lib_1 = require("common-lib");
var ConnectorEventType;
(function (ConnectorEventType) {
    ConnectorEventType[ConnectorEventType["ValueChange"] = 0] = "ValueChange";
    ConnectorEventType[ConnectorEventType["NewMessage"] = 1] = "NewMessage";
    ConnectorEventType[ConnectorEventType["GroupInput"] = 2] = "GroupInput";
})(ConnectorEventType = exports.ConnectorEventType || (exports.ConnectorEventType = {}));
class Connector {
    constructor(block, name, displayName, type, argTypes) {
        this._numValue = 0;
        this._boolValue = false;
        this._msgValue = null;
        this.argTypes = null;
        this.connections = [];
        this.block = block;
        this.name = name;
        this.displayName = displayName;
        this.type = type;
        this.argTypes = argTypes;
    }
    get value() {
        if (this.isDigital()) {
            return this._boolValue;
        }
        if (this.isAnalog()) {
            return this._numValue;
        }
        return null;
    }
    get lastMessage() {
        return this._msgValue;
    }
    set value(value) {
        if (this.isDigital()) {
            if (typeof value == 'boolean') {
                this._boolValue = value;
            }
            else if (typeof value == 'number') {
                this._boolValue = !!value;
            }
        }
        if (this.isAnalog()) {
            if (typeof value == 'boolean') {
                this._numValue = value ? 1 : 0;
            }
            else if (typeof value == 'number') {
                this._numValue = value;
            }
        }
        return;
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
        if (this.block == target.block) {
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
        if (!((this.isAnalog() && target.isAnalog()) || (this.isDigital() && target.isDigital()) || (this.isMessage() && target.isMessage()))) {
            return false;
        }
        if (this.isMessage()) {
            return Message_1.MessageHelpers.isArgTypesEqual(this.argTypes, target.argTypes);
        }
        return true;
    }
    isOutput() {
        return (this.type == common_lib_1.Types.ConnectorType.DigitalOutput) || (this.type == common_lib_1.Types.ConnectorType.AnalogOutput) || (this.type == common_lib_1.Types.ConnectorType.MessageOutput);
    }
    isInput() {
        return (this.type == common_lib_1.Types.ConnectorType.DigitalInput) || (this.type == common_lib_1.Types.ConnectorType.AnalogInput) || (this.type == common_lib_1.Types.ConnectorType.MessageInput);
    }
    isAnalog() {
        return (this.type == common_lib_1.Types.ConnectorType.AnalogOutput) || (this.type == common_lib_1.Types.ConnectorType.AnalogInput);
    }
    isDigital() {
        return (this.type == common_lib_1.Types.ConnectorType.DigitalOutput) || (this.type == common_lib_1.Types.ConnectorType.DigitalInput);
    }
    isMessage() {
        return (this.type == common_lib_1.Types.ConnectorType.MessageInput) || (this.type == common_lib_1.Types.ConnectorType.MessageOutput);
    }
    haveFreeSpace() {
        if (this.type == common_lib_1.Types.ConnectorType.DigitalInput || this.type == common_lib_1.Types.ConnectorType.AnalogInput) {
            return (this.connections.length == 0);
        }
        return true;
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
    _outputSetValue(value, interfaceId) {
        let boolVal = null;
        let numVal = null;
        let msgVal = null;
        let type = ConnectorEventType.ValueChange;
        if (typeof value == 'boolean') {
            boolVal = value;
            numVal = boolVal ? 1 : 0;
        }
        if (typeof value == 'number') {
            numVal = value;
            boolVal = !!numVal;
        }
        if (Array.isArray(value)) {
            msgVal = new Message_1.Message(this.argTypes.slice(0), value);
            type = ConnectorEventType.NewMessage;
        }
        if (value instanceof Message_1.Message) {
            msgVal = value;
            type = ConnectorEventType.NewMessage;
        }
        if (interfaceId) {
            type = ConnectorEventType.GroupInput;
        }
        let event = {
            connector: this,
            eventType: type,
            value: null,
            interfaceId: interfaceId
        };
        if (this.type == common_lib_1.Types.ConnectorType.DigitalOutput) {
            if (boolVal == null)
                return;
            if (this._boolValue == boolVal)
                return;
            this._boolValue = boolVal;
            event.value = boolVal;
            this.block._outputEvent(event);
            return;
        }
        else if (this.type == common_lib_1.Types.ConnectorType.AnalogOutput) {
            if (numVal == null)
                return;
            if (this._numValue == numVal)
                return;
            this._numValue = numVal;
            event.value = numVal;
            this.block._outputEvent(event);
            return;
        }
        else if (this.type == common_lib_1.Types.ConnectorType.MessageOutput) {
            if (msgVal == null)
                return;
            if (!msgVal.isArgTypesEqual(this.argTypes))
                return;
            if (this.renderer) {
                this.renderer.messageHighlight();
            }
            this.connections.forEach(connection => {
                if (connection.renderer) {
                    connection.renderer.messageHighlight();
                }
            });
            this._msgValue = msgVal;
            event.value = msgVal;
            this.block._outputEvent(event);
            return;
        }
        console.log('Cannot call setValue on not-output connectors!');
    }
    _inputSetValue(value, interfaceId) {
        let boolVal = null;
        let numVal = null;
        let msgVal = null;
        let type = ConnectorEventType.ValueChange;
        if (typeof value == 'boolean') {
            boolVal = value;
            numVal = boolVal ? 1 : 0;
        }
        if (typeof value == 'number') {
            numVal = value;
            boolVal = !!numVal;
        }
        if (value instanceof Message_1.Message) {
            msgVal = value;
            type = ConnectorEventType.NewMessage;
        }
        if (interfaceId) {
            type = ConnectorEventType.GroupInput;
        }
        let event = {
            connector: this,
            eventType: type,
            value: null,
            interfaceId: interfaceId
        };
        if (this.type == common_lib_1.Types.ConnectorType.DigitalInput) {
            if (boolVal == null)
                return;
            if (this._boolValue == boolVal)
                return;
            this._boolValue = boolVal;
            event.value = boolVal;
            this.block._inputEvent(event);
            return;
        }
        else if (this.type == common_lib_1.Types.ConnectorType.AnalogInput) {
            if (numVal == null)
                return;
            if (this._numValue == numVal)
                return;
            this._numValue = numVal;
            event.value = numVal;
            this.block._inputEvent(event);
            return;
        }
        else if (this.type == common_lib_1.Types.ConnectorType.MessageInput) {
            if (!msgVal)
                return;
            if (msgVal.isArgTypesEqual(this.argTypes)) {
                if (this.renderer) {
                    this.renderer.messageHighlight();
                }
                this._msgValue = msgVal;
                event.value = msgVal;
                this.block._inputEvent(event);
            }
            return;
        }
        console.log('Cannot call _inputSetValue on not-inputs connectors!');
    }
}
exports.Connector = Connector;
