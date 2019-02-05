"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ExternalConnector_1 = require("../Core/ExternalConnector");
const Message_1 = require("../Core/Message");
const common_lib_1 = require("common-lib");
const Core_1 = require("../Core");
const Events_1 = require("../Core/Events");
var InterfaceBlockType;
(function (InterfaceBlockType) {
    InterfaceBlockType[InterfaceBlockType["Inputs"] = 0] = "Inputs";
    InterfaceBlockType[InterfaceBlockType["Outputs"] = 1] = "Outputs";
})(InterfaceBlockType = exports.InterfaceBlockType || (exports.InterfaceBlockType = {}));
class BaseInterfaceBlock extends Core_1.Block {
    constructor(id, type, interfaceType) {
        super(id, type);
        this._displayName = '';
        this._group = false;
        this._deviceInputsCount = 0;
        this._deviceOutputsCount = 0;
        this._interfaceType = interfaceType;
    }
    initialize() {
        this.setInterface(this._interface);
    }
    getDataJson() {
        let data = super.getDataJson();
        data['interface'] = this.interface;
        data['targetId'] = this.targetId;
        data['group'] = this.group;
        return data;
    }
    setDataJson(data) {
        super.setDataJson(data);
        if (data['interface']) {
            this._interface = data['interface'];
            if (data['targetId']) {
                this._targetId = data['targetId'];
            }
            if (data['group']) {
                this._group = data['group'];
            }
        }
    }
    setInterface(iface) {
        let wantedInputsOrder = [];
        let wantedOutputsOrder = [];
        let inputsToDelete = this.getInputConnectors().slice(0);
        let outputsToDelete = this.getOutputConnectors().slice(0);
        this.getExternalInputConnectors().slice(0).forEach((con) => this.removeExternalInputConnector(con));
        this.getExternalOutputConnectors().slice(0).forEach((con) => this.removeExternalOutputConnector(con));
        this._deviceInputsCount = 0;
        this._deviceOutputsCount = 0;
        this._interface = iface;
        if (iface.code) {
            this.name = iface.code.programName ? iface.code.programName : iface.code.versionId;
            this._interfaceId = iface.code.versionId;
            if (this._interfaceType === InterfaceBlockType.Inputs) {
                this._deviceInputsCount++;
                let connectorId = 'd_byzance_device_restart';
                wantedInputsOrder.push(connectorId);
                let c = null;
                inputsToDelete.forEach((con) => {
                    if ((con.id === connectorId) && (con.type === common_lib_1.Types.ConnectorType.DigitalInput)) {
                        c = con;
                    }
                });
                if (c) {
                    inputsToDelete.splice(inputsToDelete.indexOf(c), 1);
                }
                else {
                    this.restartDeviceInput = this.addInputConnector(connectorId, common_lib_1.Types.ConnectorType.DigitalInput, 'Restart');
                }
            }
            if (this._interfaceType === InterfaceBlockType.Outputs) {
                let connectorId = 'd_byzance_device_online';
                wantedOutputsOrder.push(connectorId);
                let c = null;
                outputsToDelete.forEach((con) => {
                    if ((con.id === connectorId) && (con.type === common_lib_1.Types.ConnectorType.DigitalOutput)) {
                        c = con;
                    }
                });
                if (c) {
                    outputsToDelete.splice(outputsToDelete.indexOf(c), 1);
                }
                else {
                    this.networkStatusOutput = this.addOutputConnector(connectorId, common_lib_1.Types.ConnectorType.DigitalOutput, 'Online');
                }
            }
        }
        else if (iface.grid && typeof iface.grid === 'object') {
            this.name = iface.grid.projectName ? iface.grid.projectName : iface.grid.projectId;
            this._interfaceId = iface.grid.projectId;
            this._targetId = iface.grid.projectId;
        }
        else if (iface['interfaceId']) {
            this._interfaceId = iface['interfaceId'];
        }
        let inOutInterfaces = iface['interface'];
        let digitalInputs = inOutInterfaces['digitalInputs'];
        if (digitalInputs) {
            for (let name in digitalInputs) {
                if (!digitalInputs.hasOwnProperty(name)) {
                    continue;
                }
                this._deviceInputsCount++;
                if (this._interfaceType === InterfaceBlockType.Inputs) {
                    let connectorId = 'd_' + name;
                    wantedInputsOrder.push(connectorId);
                    let c = null;
                    inputsToDelete.forEach((con) => {
                        if ((con.id === connectorId) && (con.type === common_lib_1.Types.ConnectorType.DigitalInput)) {
                            c = con;
                        }
                    });
                    if (c) {
                        inputsToDelete.splice(inputsToDelete.indexOf(c), 1);
                    }
                    else {
                        this.addInputConnector(connectorId, common_lib_1.Types.ConnectorType.DigitalInput, name);
                    }
                    this.addExternalOutputConnector(this._targetId, name, common_lib_1.Types.ConnectorType.DigitalOutput);
                }
            }
        }
        let analogInputs = inOutInterfaces['analogInputs'];
        if (analogInputs) {
            for (let name in analogInputs) {
                if (!analogInputs.hasOwnProperty(name)) {
                    continue;
                }
                this._deviceInputsCount++;
                if (this._interfaceType === InterfaceBlockType.Inputs) {
                    let connectorId = 'a_' + name;
                    wantedInputsOrder.push(connectorId);
                    let c = null;
                    inputsToDelete.forEach((con) => {
                        if ((con.id === connectorId) && (con.type === common_lib_1.Types.ConnectorType.AnalogInput)) {
                            c = con;
                        }
                    });
                    if (c) {
                        inputsToDelete.splice(inputsToDelete.indexOf(c), 1);
                    }
                    else {
                        this.addInputConnector(connectorId, common_lib_1.Types.ConnectorType.AnalogInput, name);
                    }
                    this.addExternalOutputConnector(this._targetId, name, common_lib_1.Types.ConnectorType.AnalogOutput);
                }
            }
        }
        let messageInputs = inOutInterfaces['messageInputs'];
        if (messageInputs) {
            for (let name in messageInputs) {
                if (!messageInputs.hasOwnProperty(name)) {
                    continue;
                }
                this._deviceInputsCount++;
                if (this._interfaceType === InterfaceBlockType.Inputs) {
                    let argTypes = Message_1.MessageHelpers.argTypesFromStringArgTypes(messageInputs[name].messageTypes);
                    let connectorId = 'm_' + name;
                    wantedInputsOrder.push(connectorId);
                    let c = null;
                    inputsToDelete.forEach((con) => {
                        if ((con.id === connectorId) && (con.type === common_lib_1.Types.ConnectorType.MessageInput)) {
                            c = con;
                        }
                    });
                    if (c) {
                        inputsToDelete.splice(inputsToDelete.indexOf(c), 1);
                        if (!Message_1.MessageHelpers.isArgTypesEqual(argTypes, c.argTypes)) {
                            this.removeInputConnector(c);
                            this.addInputConnector(connectorId, common_lib_1.Types.ConnectorType.MessageInput, name, argTypes);
                        }
                    }
                    else {
                        this.addInputConnector(connectorId, common_lib_1.Types.ConnectorType.MessageInput, name, argTypes);
                    }
                    this.addExternalOutputConnector(this._targetId, name, common_lib_1.Types.ConnectorType.MessageOutput, argTypes);
                }
            }
        }
        let digitalOutputs = inOutInterfaces['digitalOutputs'];
        if (digitalOutputs) {
            for (let name in digitalOutputs) {
                if (!digitalOutputs.hasOwnProperty(name)) {
                    continue;
                }
                this._deviceOutputsCount++;
                if (this._interfaceType === InterfaceBlockType.Outputs) {
                    let connectorId = 'd_' + name;
                    wantedOutputsOrder.push(connectorId);
                    let c = null;
                    outputsToDelete.forEach((con) => {
                        if ((con.id === connectorId) && (con.type === common_lib_1.Types.ConnectorType.DigitalOutput)) {
                            c = con;
                        }
                    });
                    if (c) {
                        outputsToDelete.splice(outputsToDelete.indexOf(c), 1);
                    }
                    else {
                        this.addOutputConnector(connectorId, common_lib_1.Types.ConnectorType.DigitalOutput, name);
                    }
                    this.addExternalInputConnector(this._targetId, name, common_lib_1.Types.ConnectorType.DigitalInput);
                }
            }
        }
        let analogOutputs = inOutInterfaces['analogOutputs'];
        if (analogOutputs) {
            for (let name in analogOutputs) {
                if (!analogOutputs.hasOwnProperty(name)) {
                    continue;
                }
                this._deviceOutputsCount++;
                if (this._interfaceType === InterfaceBlockType.Outputs) {
                    let connectorId = 'a_' + name;
                    wantedOutputsOrder.push(connectorId);
                    let c = null;
                    outputsToDelete.forEach((con) => {
                        if ((con.id === connectorId) && (con.type === common_lib_1.Types.ConnectorType.AnalogOutput)) {
                            c = con;
                        }
                    });
                    if (c) {
                        outputsToDelete.splice(outputsToDelete.indexOf(c), 1);
                    }
                    else {
                        this.addOutputConnector(connectorId, common_lib_1.Types.ConnectorType.AnalogOutput, name);
                    }
                    this.addExternalInputConnector(this._targetId, name, common_lib_1.Types.ConnectorType.AnalogInput);
                }
            }
        }
        let messageOutputs = inOutInterfaces['messageOutputs'];
        if (messageOutputs) {
            for (let name in messageOutputs) {
                if (!messageOutputs.hasOwnProperty(name)) {
                    continue;
                }
                this._deviceOutputsCount++;
                if (this._interfaceType === InterfaceBlockType.Outputs) {
                    let argTypes = Message_1.MessageHelpers.argTypesFromStringArgTypes(messageOutputs[name].messageTypes);
                    let connectorId = 'm_' + name;
                    wantedOutputsOrder.push(connectorId);
                    let c = null;
                    outputsToDelete.forEach((con) => {
                        if ((con.id === connectorId) && (con.type === common_lib_1.Types.ConnectorType.MessageOutput)) {
                            c = con;
                        }
                    });
                    if (c) {
                        outputsToDelete.splice(outputsToDelete.indexOf(c), 1);
                        if (!Message_1.MessageHelpers.isArgTypesEqual(argTypes, c.argTypes)) {
                            this.removeOutputConnector(c);
                            this.addOutputConnector(connectorId, common_lib_1.Types.ConnectorType.MessageOutput, name, argTypes);
                        }
                    }
                    else {
                        this.addOutputConnector(connectorId, common_lib_1.Types.ConnectorType.MessageOutput, name, argTypes);
                    }
                    this.addExternalInputConnector(this._targetId, name, common_lib_1.Types.ConnectorType.MessageInput, argTypes);
                }
            }
        }
        inputsToDelete.forEach((con) => {
            this.removeInputConnector(con);
        });
        outputsToDelete.forEach((con) => {
            this.removeOutputConnector(con);
        });
        this.inputConnectors.sort((ca, cb) => {
            return wantedInputsOrder.indexOf(ca.id) - wantedInputsOrder.indexOf(cb.id);
        });
        this.outputConnectors.sort((ca, cb) => {
            return wantedOutputsOrder.indexOf(ca.id) - wantedOutputsOrder.indexOf(cb.id);
        });
    }
    setTargetId(targetId) {
        this._targetId = targetId;
        this.getExternalInputConnectors().forEach((con) => {
            con.targetId = targetId;
        });
        this.getExternalOutputConnectors().forEach((con) => {
            con.targetId = targetId;
        });
    }
    get interface() {
        return this._interface;
    }
    get targetId() {
        return this._targetId;
    }
    get interfaceId() {
        return this._interfaceId;
    }
    set group(value) {
        this._group = value;
    }
    get group() {
        return this._group;
    }
    getOther() {
        let other;
        if (this.isInput()) {
            other = this.controller.getBlockById(this.id.replace('IN', 'OUT'));
        }
        else {
            other = this.controller.getBlockById(this.id.replace('OUT', 'IN'));
        }
        return other;
    }
    isInput() {
        return this instanceof InputsInterfaceBlock;
    }
    isGrid() {
        return !!this._interface.grid;
    }
    externalInputEvent(event) {
        if (event.connector) {
            let name = '';
            switch (event.connector.type) {
                case 'digital': {
                    name = 'd_' + event.connector.name;
                    break;
                }
                case 'analog': {
                    name = 'a_' + event.connector.name;
                    break;
                }
                case 'message': {
                    name = 'm_' + event.connector.name;
                    break;
                }
            }
            let con = this.getOutputConnectorById(name);
            if (con) {
                con._outputSetValue(event.value, event.targetId, event.eventType === Core_1.ConnectorEventType.GroupInput);
            }
        }
    }
    inputChanged(event) {
        if (event.connector) {
            let type = event.connector.id.substr(0, 1);
            let name = event.connector.id.substr(2);
            if (this.restartDeviceInput && this.restartDeviceInput.id === event.connector.id && event.value) {
                this.controller.callHardwareRestartCallback(event.interfaceId ? event.interfaceId : this._targetId);
            }
            this.getExternalOutputConnectors().forEach((con) => {
                if (con.name === name) {
                    if ((type === 'a') && (con instanceof ExternalConnector_1.ExternalAnalogConnector)) {
                        con.setValue(event.value, event.interfaceId);
                    }
                    if ((type === 'd') && (con instanceof ExternalConnector_1.ExternalDigitalConnector)) {
                        con.setValue(event.value, event.interfaceId);
                    }
                    if ((type === 'm') && (con instanceof ExternalConnector_1.ExternalMessageConnector)) {
                        con.setValue(event.value, event.interfaceId);
                    }
                }
            });
        }
    }
    getRestartDeviceInput() {
        return this.restartDeviceInput;
    }
    getNetworkStatusOutput() {
        return this.networkStatusOutput;
    }
    bindInterface(targetId, group) {
        if (this.interfaceId !== this.targetId) {
            let other = this.getOther();
            this.setTargetId(targetId);
            other.setTargetId(targetId);
            if (group) {
                this.group = group;
                other.group = group;
            }
            this.emit(this, new Events_1.BindInterfaceEvent());
            other.emit(other, new Events_1.BindInterfaceEvent());
            return {
                targetId: targetId,
                interfaceId: this.interfaceId,
                group: this.group
            };
        }
        else {
            console.warn('BaseInterfaceBlock::bindInterface - same interfaceId as targetId, grid?');
            return null;
        }
    }
    remove() {
        super.remove();
        let other = this.getOther();
        if (other) {
            other.remove();
        }
    }
    isInterface() {
        return true;
    }
}
exports.BaseInterfaceBlock = BaseInterfaceBlock;
class InputsInterfaceBlock extends BaseInterfaceBlock {
    constructor(id, iface = null) {
        super(id, 'inputsInterfaceBlock', InterfaceBlockType.Inputs);
        if (iface) {
            this._interface = iface;
        }
    }
}
exports.InputsInterfaceBlock = InputsInterfaceBlock;
class OutputsInterfaceBlock extends BaseInterfaceBlock {
    constructor(id, iface = null) {
        super(id, 'outputsInterfaceBlock', InterfaceBlockType.Outputs);
        if (iface) {
            this._interface = iface;
        }
    }
}
exports.OutputsInterfaceBlock = OutputsInterfaceBlock;
