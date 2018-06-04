"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Connector_1 = require("./Connector");
const Message_1 = require("./Message");
var ExternalConnectorType;
(function (ExternalConnectorType) {
    ExternalConnectorType[ExternalConnectorType["Input"] = 0] = "Input";
    ExternalConnectorType[ExternalConnectorType["Output"] = 1] = "Output";
})(ExternalConnectorType = exports.ExternalConnectorType || (exports.ExternalConnectorType = {}));
class ExternalConnector {
    constructor(block, targetId, name, type) {
        this.block = block;
        this._targetId = targetId;
        this._name = name;
        this.type = type;
    }
    getValue() {
        return this.value;
    }
    setValue(value, interfaceId) {
        this.value = value;
        let type = Connector_1.ConnectorEventType.ValueChange;
        if (interfaceId) {
            type = Connector_1.ConnectorEventType.GroupInput;
        }
        else if (this instanceof ExternalMessageConnector) {
            type = Connector_1.ConnectorEventType.NewMessage;
        }
        let event = {
            connector: this,
            eventType: type,
            value: value,
            interfaceId: interfaceId
        };
        if (this.type === ExternalConnectorType.Input) {
            this.block._externalInputEvent(event);
        }
        else {
            this.block._externalOutputEvent(event);
        }
    }
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = value;
    }
    set targetId(value) {
        this._targetId = value;
    }
    get targetId() {
        return this._targetId;
    }
}
exports.ExternalConnector = ExternalConnector;
class ExternalDigitalConnector extends ExternalConnector {
    constructor(block, targetId, name, type) {
        super(block, targetId, name, type);
        this.value = false;
    }
}
exports.ExternalDigitalConnector = ExternalDigitalConnector;
class ExternalAnalogConnector extends ExternalConnector {
    constructor(block, targetId, name, type) {
        super(block, targetId, name, type);
        this.value = 0;
    }
}
exports.ExternalAnalogConnector = ExternalAnalogConnector;
class ExternalMessageConnector extends ExternalConnector {
    constructor(block, targetId, name, type, argTypes) {
        super(block, targetId, name, type);
        this._argTypes = argTypes;
        this.value = null;
    }
    get argTypes() {
        return this._argTypes;
    }
    isArgTypesEqual(argTypes) {
        return Message_1.MessageHelpers.isArgTypesEqual(this._argTypes, argTypes);
    }
    setValue(value, interfaceId) {
        if (this.isArgTypesEqual(value.argTypes)) {
            super.setValue(value, interfaceId);
        }
    }
}
exports.ExternalMessageConnector = ExternalMessageConnector;
