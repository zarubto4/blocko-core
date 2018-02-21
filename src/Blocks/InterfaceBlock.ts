

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
    interfaceId: string;
    displayName: string;
    color: string;
    pos_x?: number;
    pos_y?: number;
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

    private _displayName: string = "";
    private _targetId: string;
    private _interfaceId: string;

    private _interfaceType:InterfaceBlockType;

    private _deviceInputsCount:number = 0;
    private _deviceOutputsCount:number = 0;

    private _interface:BlockoTargetInterface;

    public constructor(id:string, type:string, visualType:string, interfaceType:InterfaceBlockType) {
        super(id, type, visualType);
        this._interfaceType = interfaceType;
    }

    public setInterface(iface:BlockoTargetInterface):void {

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
                if (!digitalInputs.hasOwnProperty(name)) continue;

                this._deviceInputsCount++;
                if (this._interfaceType == InterfaceBlockType.Inputs) {
                    let n = "d_"+name;
                    wantedInputsOrder.push(n);
                    let c = null;
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
                    this.addExternalOutputConnector(this._targetId, name, Types.ConnectorType.DigitalOutput);
                }
            }
        }

        let analogInputs = inOutInterfaces["analogInputs"];
        if (analogInputs) {
            for (let name in analogInputs) {
                if (!analogInputs.hasOwnProperty(name)) continue;

                this._deviceInputsCount++;
                if (this._interfaceType == InterfaceBlockType.Inputs) {
                    let n = "a_"+name;
                    wantedInputsOrder.push(n);
                    let c = null;
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
                    this.addExternalOutputConnector(this._targetId, name, Types.ConnectorType.AnalogOutput);
                }
            }
        }

        let messageInputs = inOutInterfaces["messageInputs"];
        if (messageInputs) {
            for (let name in messageInputs) {
                if (!messageInputs.hasOwnProperty(name)) continue;

                this._deviceInputsCount++;
                if (this._interfaceType == InterfaceBlockType.Inputs) {

                    let argTypes = MessageHelpers.argTypesFromStringArgTypes(messageInputs[name].messageTypes);

                    let n = "m_"+name;
                    wantedInputsOrder.push(n);
                    let c = null;
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

                    this.addExternalOutputConnector(this._targetId, name, Types.ConnectorType.MessageOutput, argTypes);
                }
            }
        }


        let digitalOutputs = inOutInterfaces["digitalOutputs"];
        if (digitalOutputs) {
            for (let name in digitalOutputs) {
                if (!digitalOutputs.hasOwnProperty(name)) continue;

                this._deviceOutputsCount++;
                if (this._interfaceType == InterfaceBlockType.Outputs) {
                    let n = "d_"+name;
                    wantedOutputsOrder.push(n);
                    let c = null;
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
                    this.addExternalInputConnector(this._targetId, name, Types.ConnectorType.DigitalInput);
                }
            }
        }

        let analogOutputs = inOutInterfaces["analogOutputs"];
        if (analogOutputs) {
            for (let name in analogOutputs) {
                if (!analogOutputs.hasOwnProperty(name)) continue;

                this._deviceOutputsCount++;
                if (this._interfaceType == InterfaceBlockType.Outputs) {
                    let n = "a_"+name;
                    wantedOutputsOrder.push(n);
                    let c = null;
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
                    this.addExternalInputConnector(this._targetId, name, Types.ConnectorType.AnalogInput);
                }
            }
        }

        let messageOutputs = inOutInterfaces["messageOutputs"];
        if (messageOutputs) {
            for (let name in messageOutputs) {
                if (!messageOutputs.hasOwnProperty(name)) continue;

                this._deviceOutputsCount++;
                if (this._interfaceType == InterfaceBlockType.Outputs) {

                    let argTypes = MessageHelpers.argTypesFromStringArgTypes(messageOutputs[name].messageTypes);

                    let n = "m_"+name;
                    wantedOutputsOrder.push(n);
                    let c = null;
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

                    this.addExternalInputConnector(this._targetId, name, Types.ConnectorType.MessageInput, argTypes);
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

    public setTargetId(targetId: string): void {
        this._targetId = targetId;
    }

    get interface():any {
        return this._interface;
    }

    get targetId():string {
        return this._targetId;
    }

    get interfaceId():string {
        return this._interfaceId;
    }

    /**
     * Gets the opposite side of this interface. (e.g. if this is input interface return output interface)
     * @returns {BaseInterfaceBlock}
     */
    public getOther(): BaseInterfaceBlock {
        let other;
        if (this.isInput()) {
            other = this.controller.getBlockById(this.id.replace('IN', 'OUT'));
        } else {
            other = this.controller.getBlockById(this.id.replace('OUT', 'IN'));
        }

        return other;
    }

    public isInput(): boolean {
        return this instanceof InputsInterfaceBlock;
    }

    public externalInputEvent(connector:ExternalConnector<any>, eventType:ConnectorEventType, value:boolean|number|Message):void {
        if (!connector) return;

        let name = "";
        if (connector instanceof ExternalAnalogConnector) {
            name = "a_"+connector.name;
        }
        if (connector instanceof ExternalDigitalConnector) {
            name = "d_"+connector.name;
        }
        if (connector instanceof ExternalMessageConnector) {
            name = "m_"+connector.name;
        }

        let con = this.getOutputConnectorByName(name);
        if (con) {
            con._outputSetValue(value);
        }
    }

    public inputChanged(connector:Connector, eventType:ConnectorEventType, value:boolean|number|Message):void {
        if (!connector) return;

        let type = connector.name.substr(0, 1);
        let name = connector.name.substr(2);

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
        let maxCon = Math.max(this._deviceInputsCount, this._deviceOutputsCount);
        let height = Math.max(139, 139 + ((maxCon-6) * 20));
        return new Size(49+10, height);
    }

    public rendererShowBlockName(): boolean {
        return false;
    }

    public rendererCanDelete():boolean {
        return true;
    }

    public rendererGetDisplayName():string {
        return this._displayName;
    }

    public rendererRotateDisplayName(): number {
        return -75;
    }

    public rendererGetBlockBackgroundColor():string {
        if (this._color) {
            return this._color;
        }
        return "#48b5af";
    }

    public rendererCustomSvgPath(size:Size):string {
        let roundRadius = 2;
        let waveWide = 15;
        if (this._interfaceType == InterfaceBlockType.Outputs) {
            return "m0 0 l" + (size.width - roundRadius) + " 0 c" + (roundRadius / 2) + " 0 " + roundRadius + " " + (roundRadius / 2) + " " + roundRadius + " " + roundRadius + " l0 " + (size.height - (2 * roundRadius)) + " c0 " + (roundRadius / 2) + " -" + (roundRadius / 2) + " " + roundRadius + " -" + roundRadius + " " + roundRadius + " l-" + (size.width - roundRadius) + " 0 c" + waveWide + " -" + (size.height / 2) + " -" + waveWide + " -" + (size.height / 2) + " 0 -" + size.height + " z"
        }
        if (this._interfaceType == InterfaceBlockType.Inputs) {
            return "m"+size.width+" 0 c-" + waveWide + " " + (size.height / 2) + " " + waveWide + " " + (size.height / 2) + " 0 " + size.height + " l-" + (size.width - roundRadius) + " 0 c-" + (roundRadius / 2) + " 0 -" + roundRadius + " -" + (roundRadius / 2) + " -" + roundRadius + " -" + roundRadius + " l0 -" + (size.height - (2*roundRadius)) + " c0 -"+(roundRadius/2)+" "+(roundRadius/2)+" -"+roundRadius+" "+roundRadius+" -"+roundRadius+" z";
        }
    }

    public rendererIsHwAttached(): boolean {
        return !!this._targetId;
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