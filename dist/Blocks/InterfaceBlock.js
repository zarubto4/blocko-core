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
        this._color = null;
        this._displayName = "";
        this._targetId = "";
        this._deviceInputsCount = 0;
        this._deviceOutputsCount = 0;
        this._interfaceType = interfaceType;
    }
    setInterface(iface) {
        var wantedInputsOrder = [];
        var wantedOutputsOrder = [];
        var inputsToDelete = this.getInputConnectors().slice(0);
        var outputsToDelete = this.getOutputConnectors().slice(0);
        this.getExternalInputConnectors().slice(0).forEach((con) => this.removeExternalInputConnector(con));
        this.getExternalOutputConnectors().slice(0).forEach((con) => this.removeExternalOutputConnector(con));
        this._deviceInputsCount = 0;
        this._deviceOutputsCount = 0;
        this._interface = iface;
        this._color = iface["color"];
        this._targetId = iface["targetId"];
        this._displayName = iface["displayName"] || this._targetId;
        var inOutInterfaces = iface["interface"];
        var digitalInputs = inOutInterfaces["digitalInputs"];
        if (digitalInputs) {
            for (var name in digitalInputs) {
                if (!digitalInputs.hasOwnProperty(name))
                    continue;
                this._deviceInputsCount++;
                if (this._interfaceType == InterfaceBlockType.Inputs) {
                    var n = "d_" + name;
                    wantedInputsOrder.push(n);
                    var c = null;
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
        var analogInputs = inOutInterfaces["analogInputs"];
        if (analogInputs) {
            for (var name in analogInputs) {
                if (!analogInputs.hasOwnProperty(name))
                    continue;
                this._deviceInputsCount++;
                if (this._interfaceType == InterfaceBlockType.Inputs) {
                    var n = "a_" + name;
                    wantedInputsOrder.push(n);
                    var c = null;
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
        var messageInputs = inOutInterfaces["messageInputs"];
        if (messageInputs) {
            for (var name in messageInputs) {
                if (!messageInputs.hasOwnProperty(name))
                    continue;
                this._deviceInputsCount++;
                if (this._interfaceType == InterfaceBlockType.Inputs) {
                    var argTypes = Message_1.MessageHelpers.argTypesFromStringArgTypes(messageInputs[name].messageTypes);
                    var n = "m_" + name;
                    wantedInputsOrder.push(n);
                    var c = null;
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
        var digitalOutputs = inOutInterfaces["digitalOutputs"];
        if (digitalOutputs) {
            for (var name in digitalOutputs) {
                if (!digitalOutputs.hasOwnProperty(name))
                    continue;
                this._deviceOutputsCount++;
                if (this._interfaceType == InterfaceBlockType.Outputs) {
                    var n = "d_" + name;
                    wantedOutputsOrder.push(n);
                    var c = null;
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
        var analogOutputs = inOutInterfaces["analogOutputs"];
        if (analogOutputs) {
            for (var name in analogOutputs) {
                if (!analogOutputs.hasOwnProperty(name))
                    continue;
                this._deviceOutputsCount++;
                if (this._interfaceType == InterfaceBlockType.Outputs) {
                    var n = "a_" + name;
                    wantedOutputsOrder.push(n);
                    var c = null;
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
        var messageOutputs = inOutInterfaces["messageOutputs"];
        if (messageOutputs) {
            for (var name in messageOutputs) {
                if (!messageOutputs.hasOwnProperty(name))
                    continue;
                this._deviceOutputsCount++;
                if (this._interfaceType == InterfaceBlockType.Outputs) {
                    var argTypes = Message_1.MessageHelpers.argTypesFromStringArgTypes(messageOutputs[name].messageTypes);
                    var n = "m_" + name;
                    wantedOutputsOrder.push(n);
                    var c = null;
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
    get interface() {
        return this._interface;
    }
    get targetId() {
        return this._targetId;
    }
    externalInputEvent(connector, eventType, value) {
        if (!connector)
            return;
        var name = "";
        if (connector instanceof ExternalConnector_1.ExternalAnalogConnector) {
            name = "a_" + connector.name;
        }
        if (connector instanceof ExternalConnector_1.ExternalDigitalConnector) {
            name = "d_" + connector.name;
        }
        if (connector instanceof ExternalConnector_1.ExternalMessageConnector) {
            name = "m_" + connector.name;
        }
        var con = this.getOutputConnectorByName(name);
        if (con) {
            con._outputSetValue(value);
        }
    }
    inputChanged(connector, eventType, value) {
        if (!connector)
            return;
        var type = connector.name.substr(0, 1);
        var name = connector.name.substr(2);
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
        var maxCon = Math.max(this._deviceInputsCount, this._deviceOutputsCount);
        var height = Math.max(139, 139 + ((maxCon - 6) * 20));
        return new Size_1.Size(49 + 10, height);
    }
    rendererShowBlockName() {
        return false;
    }
    rendererCanDelete() {
        return false;
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
        var roundRadius = 2;
        var waveWide = 15;
        if (this._interfaceType == InterfaceBlockType.Outputs) {
            return "m0 0 l" + (size.width - roundRadius) + " 0 c" + (roundRadius / 2) + " 0 " + roundRadius + " " + (roundRadius / 2) + " " + roundRadius + " " + roundRadius + " l0 " + (size.height - (2 * roundRadius)) + " c0 " + (roundRadius / 2) + " -" + (roundRadius / 2) + " " + roundRadius + " -" + roundRadius + " " + roundRadius + " l-" + (size.width - roundRadius) + " 0 c" + waveWide + " -" + (size.height / 2) + " -" + waveWide + " -" + (size.height / 2) + " 0 -" + size.height + " z";
        }
        if (this._interfaceType == InterfaceBlockType.Inputs) {
            return "m" + size.width + " 0 c-" + waveWide + " " + (size.height / 2) + " " + waveWide + " " + (size.height / 2) + " 0 " + size.height + " l-" + (size.width - roundRadius) + " 0 c-" + (roundRadius / 2) + " 0 -" + roundRadius + " -" + (roundRadius / 2) + " -" + roundRadius + " -" + roundRadius + " l0 -" + (size.height - (2 * roundRadius)) + " c0 -" + (roundRadius / 2) + " " + (roundRadius / 2) + " -" + roundRadius + " " + roundRadius + " -" + roundRadius + " z";
        }
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
