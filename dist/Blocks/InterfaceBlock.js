"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Core = require("../Core/index");
const Size_1 = require("../Core/Size");
const ExternalConnector_1 = require("../Core/ExternalConnector");
const Message_1 = require("../Core/Message");
const common_lib_1 = require("common-lib");
var InterfaceBlockType;
(function (InterfaceBlockType) {
    InterfaceBlockType[InterfaceBlockType["Inputs"] = 0] = "Inputs";
    InterfaceBlockType[InterfaceBlockType["Outputs"] = 1] = "Outputs";
})(InterfaceBlockType = exports.InterfaceBlockType || (exports.InterfaceBlockType = {}));
class BaseInterfaceBlock extends Core.Block {
    constructor(id, type, visualType, interfaceType) {
        super(id, type, visualType);
        this._displayName = "";
        this._deviceInputsCount = 0;
        this._deviceOutputsCount = 0;
        this._interfaceType = interfaceType;
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
        this._color = iface["color"];
        this._interfaceId = iface["interfaceId"];
        this._displayName = iface["displayName"] || this._interfaceId;
        let inOutInterfaces = iface["interface"];
        let digitalInputs = inOutInterfaces["digitalInputs"];
        if (digitalInputs) {
            for (let name in digitalInputs) {
                if (!digitalInputs.hasOwnProperty(name))
                    continue;
                this._deviceInputsCount++;
                if (this._interfaceType == InterfaceBlockType.Inputs) {
                    let n = "d_" + name;
                    wantedInputsOrder.push(n);
                    let c = null;
                    inputsToDelete.forEach((con) => {
                        if ((con.name == n) && (con.type == common_lib_1.Types.ConnectorType.DigitalInput)) {
                            c = con;
                        }
                    });
                    if (c) {
                        inputsToDelete.splice(inputsToDelete.indexOf(c), 1);
                    }
                    else {
                        this.addInputConnector(n, common_lib_1.Types.ConnectorType.DigitalInput, name);
                    }
                    this.addExternalOutputConnector(this._targetId, name, common_lib_1.Types.ConnectorType.DigitalOutput);
                }
            }
        }
        let analogInputs = inOutInterfaces["analogInputs"];
        if (analogInputs) {
            for (let name in analogInputs) {
                if (!analogInputs.hasOwnProperty(name))
                    continue;
                this._deviceInputsCount++;
                if (this._interfaceType == InterfaceBlockType.Inputs) {
                    let n = "a_" + name;
                    wantedInputsOrder.push(n);
                    let c = null;
                    inputsToDelete.forEach((con) => {
                        if ((con.name == n) && (con.type == common_lib_1.Types.ConnectorType.AnalogInput)) {
                            c = con;
                        }
                    });
                    if (c) {
                        inputsToDelete.splice(inputsToDelete.indexOf(c), 1);
                    }
                    else {
                        this.addInputConnector(n, common_lib_1.Types.ConnectorType.AnalogInput, name);
                    }
                    this.addExternalOutputConnector(this._targetId, name, common_lib_1.Types.ConnectorType.AnalogOutput);
                }
            }
        }
        let messageInputs = inOutInterfaces["messageInputs"];
        if (messageInputs) {
            for (let name in messageInputs) {
                if (!messageInputs.hasOwnProperty(name))
                    continue;
                this._deviceInputsCount++;
                if (this._interfaceType == InterfaceBlockType.Inputs) {
                    let argTypes = Message_1.MessageHelpers.argTypesFromStringArgTypes(messageInputs[name].messageTypes);
                    let n = "m_" + name;
                    wantedInputsOrder.push(n);
                    let c = null;
                    inputsToDelete.forEach((con) => {
                        if ((con.name == n) && (con.type == common_lib_1.Types.ConnectorType.MessageInput)) {
                            c = con;
                        }
                    });
                    if (c) {
                        inputsToDelete.splice(inputsToDelete.indexOf(c), 1);
                        if (!Message_1.MessageHelpers.isArgTypesEqual(argTypes, c.argTypes)) {
                            this.removeInputConnector(c);
                            this.addInputConnector(n, common_lib_1.Types.ConnectorType.MessageInput, name, argTypes);
                        }
                    }
                    else {
                        this.addInputConnector(n, common_lib_1.Types.ConnectorType.MessageInput, name, argTypes);
                    }
                    this.addExternalOutputConnector(this._targetId, name, common_lib_1.Types.ConnectorType.MessageOutput, argTypes);
                }
            }
        }
        let digitalOutputs = inOutInterfaces["digitalOutputs"];
        if (digitalOutputs) {
            for (let name in digitalOutputs) {
                if (!digitalOutputs.hasOwnProperty(name))
                    continue;
                this._deviceOutputsCount++;
                if (this._interfaceType == InterfaceBlockType.Outputs) {
                    let n = "d_" + name;
                    wantedOutputsOrder.push(n);
                    let c = null;
                    outputsToDelete.forEach((con) => {
                        if ((con.name == n) && (con.type == common_lib_1.Types.ConnectorType.DigitalOutput)) {
                            c = con;
                        }
                    });
                    if (c) {
                        outputsToDelete.splice(outputsToDelete.indexOf(c), 1);
                    }
                    else {
                        this.addOutputConnector(n, common_lib_1.Types.ConnectorType.DigitalOutput, name);
                    }
                    this.addExternalInputConnector(this._targetId, name, common_lib_1.Types.ConnectorType.DigitalInput);
                }
            }
        }
        let analogOutputs = inOutInterfaces["analogOutputs"];
        if (analogOutputs) {
            for (let name in analogOutputs) {
                if (!analogOutputs.hasOwnProperty(name))
                    continue;
                this._deviceOutputsCount++;
                if (this._interfaceType == InterfaceBlockType.Outputs) {
                    let n = "a_" + name;
                    wantedOutputsOrder.push(n);
                    let c = null;
                    outputsToDelete.forEach((con) => {
                        if ((con.name == n) && (con.type == common_lib_1.Types.ConnectorType.AnalogOutput)) {
                            c = con;
                        }
                    });
                    if (c) {
                        outputsToDelete.splice(outputsToDelete.indexOf(c), 1);
                    }
                    else {
                        this.addOutputConnector(n, common_lib_1.Types.ConnectorType.AnalogOutput, name);
                    }
                    this.addExternalInputConnector(this._targetId, name, common_lib_1.Types.ConnectorType.AnalogInput);
                }
            }
        }
        let messageOutputs = inOutInterfaces["messageOutputs"];
        if (messageOutputs) {
            for (let name in messageOutputs) {
                if (!messageOutputs.hasOwnProperty(name))
                    continue;
                this._deviceOutputsCount++;
                if (this._interfaceType == InterfaceBlockType.Outputs) {
                    let argTypes = Message_1.MessageHelpers.argTypesFromStringArgTypes(messageOutputs[name].messageTypes);
                    let n = "m_" + name;
                    wantedOutputsOrder.push(n);
                    let c = null;
                    outputsToDelete.forEach((con) => {
                        if ((con.name == n) && (con.type == common_lib_1.Types.ConnectorType.MessageOutput)) {
                            c = con;
                        }
                    });
                    if (c) {
                        outputsToDelete.splice(outputsToDelete.indexOf(c), 1);
                        if (!Message_1.MessageHelpers.isArgTypesEqual(argTypes, c.argTypes)) {
                            this.removeOutputConnector(c);
                            this.addOutputConnector(n, common_lib_1.Types.ConnectorType.MessageOutput, name, argTypes);
                        }
                    }
                    else {
                        this.addOutputConnector(n, common_lib_1.Types.ConnectorType.MessageOutput, name, argTypes);
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
            return wantedInputsOrder.indexOf(ca.name) - wantedInputsOrder.indexOf(cb.name);
        });
        this.outputConnectors.sort((ca, cb) => {
            return wantedOutputsOrder.indexOf(ca.name) - wantedOutputsOrder.indexOf(cb.name);
        });
        if (this.renderer) {
            this.renderer.refresh();
        }
    }
    setTargetId(targetId) {
        this._targetId = targetId;
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
    externalInputEvent(connector, eventType, value) {
        if (!connector)
            return;
        let name = "";
        if (connector instanceof ExternalConnector_1.ExternalAnalogConnector) {
            name = "a_" + connector.name;
        }
        if (connector instanceof ExternalConnector_1.ExternalDigitalConnector) {
            name = "d_" + connector.name;
        }
        if (connector instanceof ExternalConnector_1.ExternalMessageConnector) {
            name = "m_" + connector.name;
        }
        let con = this.getOutputConnectorByName(name);
        if (con) {
            con._outputSetValue(value);
        }
    }
    inputChanged(connector, eventType, value) {
        if (!connector)
            return;
        let type = connector.name.substr(0, 1);
        let name = connector.name.substr(2);
        this.getExternalOutputConnectors().forEach((con) => {
            if (con.name == name) {
                if ((type == "a") && (con instanceof ExternalConnector_1.ExternalAnalogConnector)) {
                    con.setValue(value);
                }
                if ((type == "d") && (con instanceof ExternalConnector_1.ExternalDigitalConnector)) {
                    con.setValue(value);
                }
                if ((type == "m") && (con instanceof ExternalConnector_1.ExternalMessageConnector)) {
                    con.setValue(value);
                }
            }
        });
    }
    rendererGetBlockSize() {
        let maxCon = Math.max(this._deviceInputsCount, this._deviceOutputsCount);
        let height = Math.max(139, 139 + ((maxCon - 6) * 20));
        return new Size_1.Size(49 + 10, height);
    }
    rendererShowBlockName() {
        return false;
    }
    rendererCanDelete() {
        return true;
    }
    rendererGetDisplayName() {
        return this._displayName;
    }
    rendererRotateDisplayName() {
        return -75;
    }
    rendererGetBlockBackgroundColor() {
        if (this._color) {
            return this._color;
        }
        return "#48b5af";
    }
    rendererCustomSvgPath(size) {
        let roundRadius = 2;
        let waveWide = 15;
        if (this._interfaceType == InterfaceBlockType.Outputs) {
            return "m0 0 l" + (size.width - roundRadius) + " 0 c" + (roundRadius / 2) + " 0 " + roundRadius + " " + (roundRadius / 2) + " " + roundRadius + " " + roundRadius + " l0 " + (size.height - (2 * roundRadius)) + " c0 " + (roundRadius / 2) + " -" + (roundRadius / 2) + " " + roundRadius + " -" + roundRadius + " " + roundRadius + " l-" + (size.width - roundRadius) + " 0 c" + waveWide + " -" + (size.height / 2) + " -" + waveWide + " -" + (size.height / 2) + " 0 -" + size.height + " z";
        }
        if (this._interfaceType == InterfaceBlockType.Inputs) {
            return "m" + size.width + " 0 c-" + waveWide + " " + (size.height / 2) + " " + waveWide + " " + (size.height / 2) + " 0 " + size.height + " l-" + (size.width - roundRadius) + " 0 c-" + (roundRadius / 2) + " 0 -" + roundRadius + " -" + (roundRadius / 2) + " -" + roundRadius + " -" + roundRadius + " l0 -" + (size.height - (2 * roundRadius)) + " c0 -" + (roundRadius / 2) + " " + (roundRadius / 2) + " -" + roundRadius + " " + roundRadius + " -" + roundRadius + " z";
        }
    }
    rendererIsHwAttached() {
        return !!this._targetId;
    }
}
exports.BaseInterfaceBlock = BaseInterfaceBlock;
class InputsInterfaceBlock extends BaseInterfaceBlock {
    constructor(id, iface = null) {
        super(id, "inputsInterfaceBlock", "inputsInterfaceBlock", InterfaceBlockType.Inputs);
        if (iface) {
            this.setInterface(iface);
        }
    }
}
exports.InputsInterfaceBlock = InputsInterfaceBlock;
class OutputsInterfaceBlock extends BaseInterfaceBlock {
    constructor(id, iface = null) {
        super(id, "outputsInterfaceBlock", "outputsInterfaceBlock", InterfaceBlockType.Outputs);
        if (iface) {
            this.setInterface(iface);
        }
    }
}
exports.OutputsInterfaceBlock = OutputsInterfaceBlock;
