import * as Core from '../Core/index';
import { Connector, ConnectorEventType } from '../Core/Connector';
import { Size } from '../Core/Size';
import { ExternalConnector, ExternalAnalogConnector, ExternalDigitalConnector,
    ExternalMessageConnector, ExternalConnectorType, ExternalGroupConnector
} from '../Core/ExternalConnector';
import { Message, MessageHelpers } from '../Core/Message';
import { Types } from 'common-lib';
import { InputsInterfaceBlock, InterfaceBlockType } from './InterfaceBlock';
import { BlockoTargetInterface } from './index';
import { Block } from '../Core';

export abstract class BaseInterfaceBlockGroup extends Core.Block {

    private _displayName: string = '';
    private _targetId: string;
    private _interfaceId: string;

    private _interface: BlockoTargetInterface = null;

    private _interfaceType: InterfaceBlockType;

    private _deviceInputsCount: number = 0;
    private _deviceOutputsCount: number = 0;

    public constructor(id: string, type: string, visualType: string, interfaceType: InterfaceBlockType) {
        super(id, type, visualType);
        this._interfaceType = interfaceType;
    }

    public setInterface(iface: BlockoTargetInterface): void {

        let wantedInputsOrder = [];
        let wantedOutputsOrder = [];

        let inputsToDelete = this.getInputConnectors().slice(0);
        let outputsToDelete = this.getOutputConnectors().slice(0);

        this.getExternalInputConnectors().slice(0).forEach((con) => this.removeExternalInputConnector(con));
        this.getExternalOutputConnectors().slice(0).forEach((con) => this.removeExternalOutputConnector(con));

        this._deviceInputsCount = 0;
        this._deviceOutputsCount = 0;

        this._interface = iface;

        this._color = iface['color'];
        this._interfaceId = iface["interfaceId"];
        this._displayName = iface['displayName'] || this._interfaceId;

        let inOutInterfaces = iface['interface'];

        let digitalInputs = inOutInterfaces['digitalInputs'];
        if (digitalInputs) {
            for (let name in digitalInputs) {
                if (!digitalInputs.hasOwnProperty(name)) {
                    continue;
                }

                this._deviceInputsCount++;
                if (this._interfaceType == InterfaceBlockType.Inputs) {

                    let argTypes = MessageHelpers.argTypesFromStringArgTypes(['string', 'boolean']);

                    let n = 'd_' + name;
                    wantedInputsOrder.push(n);
                    let c = null;
                    inputsToDelete.forEach((con: Connector) => {
                        if ((con.name == n) && (con.type == Types.ConnectorType.MessageInput)) {
                            c = con;
                        }
                    });
                    if (c) {
                        inputsToDelete.splice(inputsToDelete.indexOf(c), 1);
                    } else {
                        this.addInputConnector(n, Types.ConnectorType.MessageInput, name, argTypes);
                    }
                    this.addExternalOutputConnector(this._targetId, name, Types.ConnectorType.GroupOutput, argTypes, 'd');
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
                if (this._interfaceType == InterfaceBlockType.Inputs) {

                    let argTypes = MessageHelpers.argTypesFromStringArgTypes(['string', 'float']);

                    let n = 'a_' + name;
                    wantedInputsOrder.push(n);
                    let c = null;
                    inputsToDelete.forEach((con: Connector) => {
                        if ((con.name == n) && (con.type == Types.ConnectorType.MessageInput)) {
                            c = con;
                        }
                    });
                    if (c) {
                        inputsToDelete.splice(inputsToDelete.indexOf(c), 1);
                    } else {
                        this.addInputConnector(n, Types.ConnectorType.MessageInput, name, argTypes);
                    }
                    this.addExternalOutputConnector(this._targetId, name, Types.ConnectorType.GroupOutput, argTypes, 'a');
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
                if (this._interfaceType == InterfaceBlockType.Inputs) {

                    let messageTypes = messageInputs[name].messageTypes.slice(0);
                    messageTypes.unshift('string');
                    let argTypes = MessageHelpers.argTypesFromStringArgTypes(messageTypes);

                    let n = 'm_' + name;
                    wantedInputsOrder.push(n);
                    let c = null;
                    inputsToDelete.forEach((con: Connector) => {
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
                    this.addExternalOutputConnector(this._targetId, name, Types.ConnectorType.GroupOutput, argTypes, 'm');
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
                if (this._interfaceType == InterfaceBlockType.Outputs) {

                    let argTypes = MessageHelpers.argTypesFromStringArgTypes(['string', 'boolean']);

                    let n = 'd_' + name;
                    wantedOutputsOrder.push(n);
                    let c = null;
                    outputsToDelete.forEach((con: Connector) => {
                        if ((con.name == n) && (con.type == Types.ConnectorType.MessageOutput)) {
                            c = con;
                        }
                    });
                    if (c) {
                        outputsToDelete.splice(outputsToDelete.indexOf(c), 1);
                    } else {
                        this.addOutputConnector(n, Types.ConnectorType.MessageOutput, name, argTypes);
                    }
                    this.addExternalInputConnector(this._targetId, name, Types.ConnectorType.GroupInput, argTypes, 'd');
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
                if (this._interfaceType == InterfaceBlockType.Outputs) {

                    let argTypes = MessageHelpers.argTypesFromStringArgTypes(['string', 'float']);

                    let n = 'a_' + name;
                    wantedOutputsOrder.push(n);
                    let c = null;
                    outputsToDelete.forEach((con: Connector) => {
                        if ((con.name == n) && (con.type == Types.ConnectorType.MessageOutput)) {
                            c = con;
                        }
                    });
                    if (c) {
                        outputsToDelete.splice(outputsToDelete.indexOf(c), 1);
                    } else {
                        this.addOutputConnector(n, Types.ConnectorType.MessageOutput, name, argTypes);
                    }
                    this.addExternalInputConnector(this._targetId, name, Types.ConnectorType.GroupInput, argTypes, 'a');
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
                if (this._interfaceType == InterfaceBlockType.Outputs) {

                    let messageTypes = messageOutputs[name].messageTypes.slice(0);
                    messageTypes.unshift('string');
                    let argTypes = MessageHelpers.argTypesFromStringArgTypes(messageTypes);

                    let n = 'm_' + name;
                    wantedOutputsOrder.push(n);
                    let c = null;
                    outputsToDelete.forEach((con: Connector) => {
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
                    this.addExternalInputConnector(this._targetId, name, Types.ConnectorType.GroupInput, argTypes, 'm');
                }
            }
        }

        inputsToDelete.forEach((con: Connector) => {
            this.removeInputConnector(con);
        });

        outputsToDelete.forEach((con: Connector) => {
            this.removeOutputConnector(con);
        });

        // sort

        this.inputConnectors.sort((ca: Core.Connector, cb: Core.Connector) => {
            return wantedInputsOrder.indexOf(ca.name) - wantedInputsOrder.indexOf(cb.name);
        });
        this.outputConnectors.sort((ca: Core.Connector, cb: Core.Connector) => {
            return wantedOutputsOrder.indexOf(ca.name) - wantedOutputsOrder.indexOf(cb.name);
        });

        if (this.renderer) {
            this.renderer.refresh()
        }
    }

    public setTargetId(targetId: string): void {
        this._targetId = targetId;
    }

    get interface(): any {
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
     * @returns {BaseInterfaceBlockGroup}
     */
    public getOther(): BaseInterfaceBlockGroup {
        let other;
        if (this instanceof InputsInterfaceBlockGroup) {
            other = this.controller.getBlockById(this.id.replace('IN', 'OUT'));
        } else if (<BaseInterfaceBlockGroup>this instanceof OutputsInterfaceBlockGroup) {
            other = (<BaseInterfaceBlockGroup>this).controller.getBlockById((<BaseInterfaceBlockGroup>this).id.replace('OUT', 'IN'));
        }

        return other;
    }

    public isInput(): boolean {
        return this instanceof InputsInterfaceBlockGroup;
    }

    public externalInputEvent(connector: ExternalConnector<any>, eventType: ConnectorEventType, value: boolean | number | Message): void {
        if (!connector) {
            return;
        }

        let name = '';
        if (connector instanceof ExternalGroupConnector) {
            name = connector.kind + '_' + connector.name;
        }

        let con = this.getOutputConnectorByName(name);
        if (con) {
            con._outputSetValue(value);
        }
    }

    public inputChanged(connector: Connector, eventType: ConnectorEventType, value: boolean | number | Message): void {
        if (!connector || !(value instanceof Message)) {
            console.log('Value has to be message.');
            return;
        }

        let type = connector.name.substr(0, 1);
        let name = connector.name.substr(2);

        this.getExternalOutputConnectors().forEach((con: ExternalConnector<any>) => {
            if (con.name == name) {
                if (type == 'a') {
                    new ExternalAnalogConnector(this, value.values[0], name, ExternalConnectorType.Output).setValue(<number>value.values[1]);
                }
                if (type == 'd') {
                    new ExternalDigitalConnector(this, value.values[0], name, ExternalConnectorType.Output).setValue(<boolean>value.values[1]);
                }
                if (type == 'm') {
                    let targetId = value.values.shift();
                    value.argTypes.shift();
                    let argTypes = value.argTypes;
                    new ExternalMessageConnector(this, targetId, name, ExternalConnectorType.Output, argTypes).setValue(value);
                }
            }
        });
    }

    /**
     * Also removes the second half of the interface block group.
     */
    public remove():void {
        super.remove(); // Must be called before removing the opposite one, otherwise it would be cycle
        let opposite: Block = this._controller.blocks.find((b) => {
            if (b instanceof BaseInterfaceBlockGroup) {
                return this.targetId === b.targetId; // Both halves have the same targetId
            }
        });

        if (opposite) {
            opposite.remove();
        }
    }

// RENDER

    public rendererGetBlockSize(): Size {
        let maxCon = Math.max(this._deviceInputsCount, this._deviceOutputsCount);
        let height = Math.max(139, 139 + ((maxCon - 6) * 20));
        return new Size(49 + 10, height);
    }

    public rendererShowBlockName(): boolean {
        return false;
    }

    public rendererCanDelete(): boolean {
        return true;
    }

    public rendererGetDisplayName(): string {
        return this._displayName;
    }

    public rendererRotateDisplayName(): number {
        return -75;
    }

    public rendererGetBlockBackgroundColor(): string {
        if (this._color) {
            return this._color;
        }
        return '#48b5af';
    }


    public rendererCustomSvgPath(size: Size): string {
        let roundRadius = 2;
        let waveWide = 15;
        if (this._interfaceType == InterfaceBlockType.Outputs) {
            return 'm0 0 l' + (size.width - roundRadius) + ' 0 c' + (roundRadius / 2) + ' 0 ' + roundRadius + ' ' + (roundRadius / 2) + ' ' + roundRadius + ' ' + roundRadius + ' l0 ' + (size.height - (2 * roundRadius)) + ' c0 ' + (roundRadius / 2) + ' -' + (roundRadius / 2) + ' ' + roundRadius + ' -' + roundRadius + ' ' + roundRadius + ' l-' + (size.width - roundRadius) + ' 0 c' + waveWide + ' -' + (size.height / 2) + ' -' + waveWide + ' -' + (size.height / 2) + ' 0 -' + size.height + ' z'
        }
        if (this._interfaceType == InterfaceBlockType.Inputs) {
            return 'm' + size.width + ' 0 c-' + waveWide + ' ' + (size.height / 2) + ' ' + waveWide + ' ' + (size.height / 2) + ' 0 ' + size.height + ' l-' + (size.width - roundRadius) + ' 0 c-' + (roundRadius / 2) + ' 0 -' + roundRadius + ' -' + (roundRadius / 2) + ' -' + roundRadius + ' -' + roundRadius + ' l0 -' + (size.height - (2 * roundRadius)) + ' c0 -' + (roundRadius / 2) + ' ' + (roundRadius / 2) + ' -' + roundRadius + ' ' + roundRadius + ' -' + roundRadius + ' z';
        }
    }

    public rendererIsHwAttached(): boolean {
        return !!this._targetId;
    }
}

export class InputsInterfaceBlockGroup extends BaseInterfaceBlockGroup {
    public constructor(id: string, iface: any = null) {
        super(id, 'inputsInterfaceBlockGroup', 'inputsInterfaceBlockGroup', InterfaceBlockType.Inputs);
        if (iface) {
            this.setInterface(iface);
        }
    }
}

export class OutputsInterfaceBlockGroup extends BaseInterfaceBlockGroup {
    public constructor(id: string, iface: any = null) {
        super(id, 'outputsInterfaceBlockGroup', 'outputsInterfaceBlockGroup', InterfaceBlockType.Outputs);
        if (iface) {
            this.setInterface(iface);
        }
    }
}