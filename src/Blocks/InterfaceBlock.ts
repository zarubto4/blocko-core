/**
 * Created by davidhradek on 12.07.16.
 */

import * as Core from '../Core/index';
import {Connector, ConnectorEventType} from "../Core/Connector";
import {Size} from "../Core/Size";
import {
    ExternalConnector, ExternalAnalogConnector, ExternalDigitalConnector,
    ExternalMessageConnector
} from "../Core/ExternalConnector";
import {Message, MessageHelpers} from "../Core/Message";
import {Types} from "common-lib";

export enum InterfaceBlockType {Inputs, Outputs}

export interface BlockoTargetInterface {
    targetType: string;
    targetId: string;
    displayName: string;
    interface: {
        digitalInputs?: {[name:string]:any};
        digitalOutputs?: {[name:string]:any};
        analogInputs?: {[name:string]:any};
        analogOutputs?: {[name:string]:any};
        messageInputs?: {[name:string]:any};
        messageOutputs?: {[name:string]:any};
    }
}

export abstract class BaseInterfaceBlock extends Core.Block {

    public configJs:Core.ConfigProperty;

    private _targetType:string = "";
    private _displayName:string = "";
    private _targetId:string = "";

    private _interfaceType:InterfaceBlockType;

    private _deviceInputsCount:number = 0;
    private _deviceOutputsCount:number = 0;

    private _interface:any;

    public constructor(id:string, type:string, visualType:string, interfaceType:InterfaceBlockType) {
        super(id, type, visualType);
        this._interfaceType = interfaceType;
    }

    public setInterface(iface:BlockoTargetInterface):void {

        var wantedInputsOrder = [];
        var wantedOutputsOrder = [];

        var inputsToDelete = this.getInputConnectors().slice(0);
        var outputsToDelete = this.getOutputConnectors().slice(0);

        this.getExternalInputConnectors().slice(0).forEach((con) => this.removeExternalInputConnector(con));
        this.getExternalOutputConnectors().slice(0).forEach((con) => this.removeExternalOutputConnector(con));

        this._deviceInputsCount = 0;
        this._deviceOutputsCount = 0;

        this._interface = iface;

        this._targetType = iface["targetType"];
        this._displayName = iface["displayName"] || this._targetType;
        this._targetId = iface["targetId"];

        var inOutInterfaces = iface["interface"];

        var digitalInputs = inOutInterfaces["digitalInputs"];
        if (digitalInputs) {
            for (var name in digitalInputs) {
                if (!digitalInputs.hasOwnProperty(name)) continue;

                this._deviceInputsCount++;
                if (this._interfaceType == InterfaceBlockType.Inputs) {
                    var n = "d_"+name;
                    wantedInputsOrder.push(n);
                    var c = null;
                    inputsToDelete.forEach((con:Connector) => {
                        if ((con.name == n) && (con.type == Types.ConnectorType.DigitalInput)) {
                            c = con;
                        }
                    });
                    if (c) {
                        inputsToDelete.splice(inputsToDelete.indexOf(c), 1);
                    } else {
                        this.addInputConnector(n, Types.ConnectorType.DigitalInput, name);
                    }
                    this.addExternalOutputConnector(this._targetType, this._targetId, name, Types.ConnectorType.DigitalOutput);
                }
            }
        }

        var analogInputs = inOutInterfaces["analogInputs"];
        if (analogInputs) {
            for (var name in analogInputs) {
                if (!analogInputs.hasOwnProperty(name)) continue;

                this._deviceInputsCount++;
                if (this._interfaceType == InterfaceBlockType.Inputs) {
                    var n = "a_"+name;
                    wantedInputsOrder.push(n);
                    var c = null;
                    inputsToDelete.forEach((con:Connector) => {
                        if ((con.name == n) && (con.type == Types.ConnectorType.AnalogInput)) {
                            c = con;
                        }
                    });
                    if (c) {
                        inputsToDelete.splice(inputsToDelete.indexOf(c), 1);
                    } else {
                        this.addInputConnector(n, Types.ConnectorType.AnalogInput, name);
                    }
                    this.addExternalOutputConnector(this._targetType, this._targetId, name, Types.ConnectorType.AnalogOutput);
                }
            }
        }

        var messageInputs = inOutInterfaces["messageInputs"];
        if (messageInputs) {
            for (var name in messageInputs) {
                if (!messageInputs.hasOwnProperty(name)) continue;

                this._deviceInputsCount++;
                if (this._interfaceType == InterfaceBlockType.Inputs) {

                    var argTypes = MessageHelpers.argTypesFromStringArgTypes(messageInputs[name].messageTypes);

                    var n = "m_"+name;
                    wantedInputsOrder.push(n);
                    var c = null;
                    inputsToDelete.forEach((con:Connector) => {
                        if ((con.name == n) && (con.type == Types.ConnectorType.MessageInput)) {
                            c = con;
                        }
                    });
                    if (c) {
                        // console.log(c);
                        inputsToDelete.splice(inputsToDelete.indexOf(c), 1);
                        if (!MessageHelpers.isArgTypesEqual(argTypes, c.argTypes)) {
                            this.removeInputConnector(c);
                            this.addInputConnector(n, Types.ConnectorType.MessageInput, name, argTypes);
                        }
                    } else {
                        this.addInputConnector(n, Types.ConnectorType.MessageInput, name, argTypes);
                    }

                    this.addExternalOutputConnector(this._targetType, this._targetId, name, Types.ConnectorType.MessageOutput, argTypes);
                }
            }
        }


        var digitalOutputs = inOutInterfaces["digitalOutputs"];
        if (digitalOutputs) {
            for (var name in digitalOutputs) {
                if (!digitalOutputs.hasOwnProperty(name)) continue;

                this._deviceOutputsCount++;
                if (this._interfaceType == InterfaceBlockType.Outputs) {
                    var n = "d_"+name;
                    wantedOutputsOrder.push(n);
                    var c = null;
                    outputsToDelete.forEach((con:Connector) => {
                        if ((con.name == n) && (con.type == Types.ConnectorType.DigitalOutput)) {
                            c = con;
                        }
                    });
                    if (c) {
                        outputsToDelete.splice(outputsToDelete.indexOf(c), 1);
                    } else {
                        this.addOutputConnector(n, Types.ConnectorType.DigitalOutput, name);
                    }
                    this.addExternalInputConnector(this._targetType, this._targetId, name, Types.ConnectorType.DigitalInput);
                }
            }
        }

        var analogOutputs = inOutInterfaces["analogOutputs"];
        if (analogOutputs) {
            for (var name in analogOutputs) {
                if (!analogOutputs.hasOwnProperty(name)) continue;

                this._deviceOutputsCount++;
                if (this._interfaceType == InterfaceBlockType.Outputs) {
                    var n = "a_"+name;
                    wantedOutputsOrder.push(n);
                    var c = null;
                    outputsToDelete.forEach((con:Connector) => {
                        if ((con.name == n) && (con.type == Types.ConnectorType.AnalogOutput)) {
                            c = con;
                        }
                    });
                    if (c) {
                        outputsToDelete.splice(outputsToDelete.indexOf(c), 1);
                    } else {
                        this.addOutputConnector(n, Types.ConnectorType.AnalogOutput, name);
                    }
                    this.addExternalInputConnector(this._targetType, this._targetId, name, Types.ConnectorType.AnalogInput);
                }
            }
        }

        var messageOutputs = inOutInterfaces["messageOutputs"];
        if (messageOutputs) {
            for (var name in messageOutputs) {
                if (!messageOutputs.hasOwnProperty(name)) continue;

                this._deviceOutputsCount++;
                if (this._interfaceType == InterfaceBlockType.Outputs) {

                    var argTypes = MessageHelpers.argTypesFromStringArgTypes(messageOutputs[name].messageTypes);

                    var n = "m_"+name;
                    wantedOutputsOrder.push(n);
                    var c = null;
                    outputsToDelete.forEach((con:Connector) => {
                        if ((con.name == n) && (con.type == Types.ConnectorType.MessageOutput)) {
                            c = con;
                        }
                    });
                    if (c) {
                        outputsToDelete.splice(outputsToDelete.indexOf(c), 1);
                        if (!MessageHelpers.isArgTypesEqual(argTypes, c.argTypes)) {
                            this.removeOutputConnector(c);
                            this.addOutputConnector(n, Types.ConnectorType.MessageOutput, name, argTypes);
                        }
                    } else {
                        this.addOutputConnector(n, Types.ConnectorType.MessageOutput, name, argTypes);
                    }

                    this.addExternalInputConnector(this._targetType, this._targetId, name, Types.ConnectorType.MessageInput, argTypes);
                }
            }
        }

        inputsToDelete.forEach((con:Connector) => {
            this.removeInputConnector(con);
        });

        outputsToDelete.forEach((con:Connector) => {
            this.removeOutputConnector(con);
        });

        // sort

        this.inputConnectors.sort((ca:Core.Connector, cb:Core.Connector) => {
            return wantedInputsOrder.indexOf(ca.name) - wantedInputsOrder.indexOf(cb.name);
        });
        this.outputConnectors.sort((ca:Core.Connector, cb:Core.Connector) => {
            return wantedOutputsOrder.indexOf(ca.name) - wantedOutputsOrder.indexOf(cb.name);
        });

        if (this.renderer) {
            this.renderer.refresh()
        }
    }

    get interface():any {
        return this._interface;
    }

    get targetType():string {
        return this._targetType;
    }

    get targetId():string {
        return this._targetId;
    }

    public externalInputEvent(connector:ExternalConnector<any>, eventType:ConnectorEventType, value:boolean|number|Message):void {
        if (!connector) return;

        var name = "";
        if (connector instanceof ExternalAnalogConnector) {
            name = "a_"+connector.name;
        }
        if (connector instanceof ExternalDigitalConnector) {
            name = "d_"+connector.name;
        }
        if (connector instanceof ExternalMessageConnector) {
            name = "m_"+connector.name;
        }

        var con = this.getOutputConnectorByName(name);
        if (con) {
            con._outputSetValue(value);
        }
    }

    public inputChanged(connector:Connector, eventType:ConnectorEventType, value:boolean|number|Message):void {
        if (!connector) return;

        var type = connector.name.substr(0, 1);
        var name = connector.name.substr(2);

        this.getExternalOutputConnectors().forEach((con:ExternalConnector<any>) => {
            if (con.name == name) {
                if ((type == "a") && (con instanceof ExternalAnalogConnector)) {
                    (<ExternalAnalogConnector>con).setValue(<number>value);
                }
                if ((type == "d") && (con instanceof ExternalDigitalConnector)) {
                    (<ExternalDigitalConnector>con).setValue(<boolean>value);
                }
                if ((type == "m") && (con instanceof ExternalMessageConnector)) {
                    (<ExternalMessageConnector>con).setValue(<Message>value);
                }
            }
        });
    }

// RENDER

    public rendererGetBlockSize():Size {
        var maxCon = Math.max(this._deviceInputsCount, this._deviceOutputsCount);
        var height = Math.max(139, 139 + ((maxCon-6) * 20));
        return new Size(49+10, height);
    }

    public rendererShowBlockName(): boolean {
        return false;
    }

    public rendererCanDelete():boolean {
        return false;
    }

    public rendererGetDisplayName():string {
        return this._displayName;
    }

    public rendererRotateDisplayName(): number {
        return -75;
    }

    public rendererGetBlockBackgroundColor():string {
        if (this.targetType == "grid_project") {
            return "#a469bd";
        }
        return "#48b5af";
    }


    public rendererCustomSvgPath(size:Size):string {
        var roundRadius = 2;
        var waveWide = 15;
        if (this._interfaceType == InterfaceBlockType.Outputs) {
            return "m0 0 l" + (size.width - roundRadius) + " 0 c" + (roundRadius / 2) + " 0 " + roundRadius + " " + (roundRadius / 2) + " " + roundRadius + " " + roundRadius + " l0 " + (size.height - (2 * roundRadius)) + " c0 " + (roundRadius / 2) + " -" + (roundRadius / 2) + " " + roundRadius + " -" + roundRadius + " " + roundRadius + " l-" + (size.width - roundRadius) + " 0 c" + waveWide + " -" + (size.height / 2) + " -" + waveWide + " -" + (size.height / 2) + " 0 -" + size.height + " z"
        }
        if (this._interfaceType == InterfaceBlockType.Inputs) {
            return "m"+size.width+" 0 c-" + waveWide + " " + (size.height / 2) + " " + waveWide + " " + (size.height / 2) + " 0 " + size.height + " l-" + (size.width - roundRadius) + " 0 c-" + (roundRadius / 2) + " 0 -" + roundRadius + " -" + (roundRadius / 2) + " -" + roundRadius + " -" + roundRadius + " l0 -" + (size.height - (2*roundRadius)) + " c0 -"+(roundRadius/2)+" "+(roundRadius/2)+" -"+roundRadius+" "+roundRadius+" -"+roundRadius+" z";
        }
    }
}

export class InputsInterfaceBlock extends BaseInterfaceBlock {
    public constructor(id:string, iface:any = null) {
        super(id, "inputsInterfaceBlock", "inputsInterfaceBlock", InterfaceBlockType.Inputs);
        if (iface) {
            this.setInterface(iface);
        }
    }
}

export class OutputsInterfaceBlock extends BaseInterfaceBlock {
    public constructor(id:string, iface:any = null) {
        super(id, "outputsInterfaceBlock", "outputsInterfaceBlock", InterfaceBlockType.Outputs);
        if (iface) {
            this.setInterface(iface);
        }
    }
}