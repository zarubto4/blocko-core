

import * as Core from '../Core/index';
import { Connector } from '../Core/Connector';
import {
    ExternalConnector, ExternalAnalogConnector, ExternalDigitalConnector,
    ExternalMessageConnector
} from '../Core/ExternalConnector';
import { Message, MessageHelpers } from '../Core/Message';
import { Types } from 'common-lib';
import { Block, ConnectorEvent, DigitalConnector, ExternalConnectorEvent } from '../Core';

export enum InterfaceBlockType { Inputs, Outputs }

export interface BlockoTargetInterface {
    code?: {
        programId: string;
        versionId: string;
    };
    grid?: {
        projectId: string;
        programs: Array<{ programId: string; versionId: string; }>;
    };
    displayName: string;
    color: string;
    interface: {
        digitalInputs?: {[name: string]: any};
        digitalOutputs?: {[name: string]: any};
        analogInputs?: {[name: string]: any};
        analogOutputs?: {[name: string]: any};
        messageInputs?: {[name: string]: any};
        messageOutputs?: {[name: string]: any};
    }
}

export abstract class BaseInterfaceBlock extends Block {

    private _displayName: string = '';
    private _targetId: string;
    private _interfaceId: string;
    private _group: boolean = false;

    private _interfaceType: InterfaceBlockType;

    private _deviceInputsCount: number = 0;
    private _deviceOutputsCount: number = 0;

    private _interface: BlockoTargetInterface;

    protected restartDeviceInput: DigitalConnector;
    protected networkStatusOutput: DigitalConnector;

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

        if (iface.code) {
            this._interfaceId = iface.code.versionId;

            if (this._interfaceType === InterfaceBlockType.Inputs) {
                this._deviceInputsCount++;
                let connectorId = 'd_byzance_device_restart';
                wantedInputsOrder.push(connectorId);
                let c = null;
                inputsToDelete.forEach((con: Connector<boolean|number|object|Message>) => {
                    if ((con.id === connectorId) && (con.type === Types.ConnectorType.DigitalInput)) {
                        c = con;
                    }
                });
                if (c) {
                    inputsToDelete.splice(inputsToDelete.indexOf(c), 1);
                } else {
                    this.restartDeviceInput = <DigitalConnector>this.addInputConnector(connectorId, Types.ConnectorType.DigitalInput, 'Restart');
                }
            }

            if (this._interfaceType === InterfaceBlockType.Outputs) {
                let connectorId = 'd_byzance_device_online';
                wantedOutputsOrder.push(connectorId);
                let c = null;
                outputsToDelete.forEach((con: Connector<boolean|number|object|Message>) => {
                    if ((con.id === connectorId) && (con.type === Types.ConnectorType.DigitalOutput)) {
                        c = con;
                    }
                });
                if (c) {
                    outputsToDelete.splice(outputsToDelete.indexOf(c), 1);
                } else {
                    this.networkStatusOutput = <DigitalConnector>this.addOutputConnector(connectorId, Types.ConnectorType.DigitalOutput, 'Online');
                }
            }


        } else if (iface.grid && typeof iface.grid === 'object') {
            this._interfaceId = iface.grid.projectId;
            this._targetId = iface.grid.projectId;
        } else if (iface['interfaceId']) {
            this._interfaceId = iface['interfaceId']
        }

        this._color = iface['color'];
        this._displayName = iface['displayName'] || this._interfaceId;

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
                    inputsToDelete.forEach((con: Connector<boolean|number|object|Message>) => {
                        if ((con.id === connectorId) && (con.type === Types.ConnectorType.DigitalInput)) {
                            c = con;
                        }
                    });
                    if (c) {
                        inputsToDelete.splice(inputsToDelete.indexOf(c), 1);
                    } else {
                        this.addInputConnector(connectorId, Types.ConnectorType.DigitalInput, name);
                    }
                    this.addExternalOutputConnector(this._targetId, name, Types.ConnectorType.DigitalOutput);
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
                    inputsToDelete.forEach((con: Connector<boolean|number|object|Message>) => {
                        if ((con.id === connectorId) && (con.type === Types.ConnectorType.AnalogInput)) {
                            c = con;
                        }
                    });
                    if (c) {
                        inputsToDelete.splice(inputsToDelete.indexOf(c), 1);
                    } else {
                        this.addInputConnector(connectorId, Types.ConnectorType.AnalogInput, name);
                    }
                    this.addExternalOutputConnector(this._targetId, name, Types.ConnectorType.AnalogOutput);
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

                    let argTypes = MessageHelpers.argTypesFromStringArgTypes(messageInputs[name].messageTypes);

                    let connectorId = 'm_' + name;
                    wantedInputsOrder.push(connectorId);
                    let c = null;
                    inputsToDelete.forEach((con: Connector<boolean|number|object|Message>) => {
                        if ((con.id === connectorId) && (con.type === Types.ConnectorType.MessageInput)) {
                            c = con;
                        }
                    });
                    if (c) {
                        // console.log(c);
                        inputsToDelete.splice(inputsToDelete.indexOf(c), 1);
                        if (!MessageHelpers.isArgTypesEqual(argTypes, c.argTypes)) {
                            this.removeInputConnector(c);
                            this.addInputConnector(connectorId, Types.ConnectorType.MessageInput, name, argTypes);
                        }
                    } else {
                        this.addInputConnector(connectorId, Types.ConnectorType.MessageInput, name, argTypes);
                    }

                    this.addExternalOutputConnector(this._targetId, name, Types.ConnectorType.MessageOutput, argTypes);
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
                    outputsToDelete.forEach((con: Connector<boolean|number|object|Message>) => {
                        if ((con.id === connectorId) && (con.type === Types.ConnectorType.DigitalOutput)) {
                            c = con;
                        }
                    });
                    if (c) {
                        outputsToDelete.splice(outputsToDelete.indexOf(c), 1);
                    } else {
                        this.addOutputConnector(connectorId, Types.ConnectorType.DigitalOutput, name);
                    }
                    this.addExternalInputConnector(this._targetId, name, Types.ConnectorType.DigitalInput);
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
                    outputsToDelete.forEach((con: Connector<boolean|number|object|Message>) => {
                        if ((con.id === connectorId) && (con.type === Types.ConnectorType.AnalogOutput)) {
                            c = con;
                        }
                    });
                    if (c) {
                        outputsToDelete.splice(outputsToDelete.indexOf(c), 1);
                    } else {
                        this.addOutputConnector(connectorId, Types.ConnectorType.AnalogOutput, name);
                    }
                    this.addExternalInputConnector(this._targetId, name, Types.ConnectorType.AnalogInput);
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

                    let argTypes = MessageHelpers.argTypesFromStringArgTypes(messageOutputs[name].messageTypes);

                    let connectorId = 'm_' + name;
                    wantedOutputsOrder.push(connectorId);
                    let c = null;
                    outputsToDelete.forEach((con: Connector<boolean|number|object|Message>) => {
                        if ((con.id === connectorId) && (con.type === Types.ConnectorType.MessageOutput)) {
                            c = con;
                        }
                    });
                    if (c) {
                        outputsToDelete.splice(outputsToDelete.indexOf(c), 1);
                        if (!MessageHelpers.isArgTypesEqual(argTypes, c.argTypes)) {
                            this.removeOutputConnector(c);
                            this.addOutputConnector(connectorId, Types.ConnectorType.MessageOutput, name, argTypes);
                        }
                    } else {
                        this.addOutputConnector(connectorId, Types.ConnectorType.MessageOutput, name, argTypes);
                    }

                    this.addExternalInputConnector(this._targetId, name, Types.ConnectorType.MessageInput, argTypes);
                }
            }
        }

        inputsToDelete.forEach((con: Connector<boolean|number|object|Message>) => {
            this.removeInputConnector(con);
        });

        outputsToDelete.forEach((con: Connector<boolean|number|object|Message>) => {
            this.removeOutputConnector(con);
        });

        // sort

        this.inputConnectors.sort((ca: Core.Connector<boolean|number|object|Message>, cb: Core.Connector<boolean|number|object|Message>) => {
            return wantedInputsOrder.indexOf(ca.id) - wantedInputsOrder.indexOf(cb.id);
        });
        this.outputConnectors.sort((ca: Core.Connector<boolean|number|object|Message>, cb: Core.Connector<boolean|number|object|Message>) => {
            return wantedOutputsOrder.indexOf(ca.id) - wantedOutputsOrder.indexOf(cb.id);
        });

        if (this.renderer) {
            this.renderer.refresh()
        }
    }

    public setTargetId(targetId: string): void {
        this._targetId = targetId;
        this.getExternalInputConnectors().forEach((con) => {
            con.targetId = targetId;
        });
        this.getExternalOutputConnectors().forEach((con) => {
            con.targetId = targetId;
        });
    }

    get interface(): BlockoTargetInterface {
        return this._interface;
    }

    get targetId(): string {
        return this._targetId;
    }

    get interfaceId(): string {
        return this._interfaceId;
    }

    set group(value: boolean) {
        this._group = value;
    }

    get group(): boolean {
        return this._group;
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

    public isGrid(): boolean {
        return !!this._interface.grid;
    }

    public externalInputEvent(event: ExternalConnectorEvent): void {
        if (event.connector) {
            let name = '';
            if (event.connector instanceof ExternalAnalogConnector) {
                name = 'a_' + event.connector.name;
            }
            if (event.connector instanceof ExternalDigitalConnector) {
                name = 'd_' + event.connector.name;
            }
            if (event.connector instanceof ExternalMessageConnector) {
                name = 'm_' + event.connector.name;
            }

            let con = this.getOutputConnectorById(name);
            if (con) {
                con._outputSetValue(event.value, event.interfaceId);
            }
        }
    }

    public inputChanged(event: ConnectorEvent): void {
        if (event.connector) {
            let type = event.connector.id.substr(0, 1);
            let name = event.connector.id.substr(2);

            if (this.restartDeviceInput && this.restartDeviceInput.id === event.connector.id && event.value) {
                this.controller.callHardwareRestartCallback(event.interfaceId ? event.interfaceId : this._targetId);
            }

            this.getExternalOutputConnectors().forEach((con: ExternalConnector<any>) => {
                if (con.name === name) {
                    if ((type === 'a') && (con instanceof ExternalAnalogConnector)) {
                        (<ExternalAnalogConnector>con).setValue(<number>event.value, event.interfaceId);
                    }
                    if ((type === 'd') && (con instanceof ExternalDigitalConnector)) {
                        (<ExternalDigitalConnector>con).setValue(<boolean>event.value, event.interfaceId);
                    }
                    if ((type === 'm') && (con instanceof ExternalMessageConnector)) {
                        (<ExternalMessageConnector>con).setValue(<Message>event.value, event.interfaceId);
                    }
                }
            });
        }
    }

    public getRestartDeviceInput(): DigitalConnector {
        return this.restartDeviceInput;
    }

    public getNetworkStatusOutput(): DigitalConnector {
        return this.networkStatusOutput;
    }

    /**
     * Also removes the second half of the interface block group.
     */
    public remove(): void {
        super.remove(); // Must be called before removing the opposite one, otherwise it would be cycle
        let other: BaseInterfaceBlock = this.getOther();
        if (other) {
            other.remove();
        }
    }

// RENDER

    public isInterface(): boolean {
        return true;
    }

    public rendererShowBlockName(): boolean {
        return false;
    }

    public rendererGetDisplayName(): string {
        return this._displayName;
    }

    public rendererIsHwAttached(): boolean {
        return !!this._targetId;
    }
}

export class InputsInterfaceBlock extends BaseInterfaceBlock {
    public constructor(id: string, iface: any = null) {
        super(id, 'inputsInterfaceBlock', 'inputsInterfaceBlock', InterfaceBlockType.Inputs);
        if (iface) {
            this.setInterface(iface);
        }
    }
}

export class OutputsInterfaceBlock extends BaseInterfaceBlock {
    public constructor(id: string, iface: any = null) {
        super(id, 'outputsInterfaceBlock', 'outputsInterfaceBlock', InterfaceBlockType.Outputs);
        if (iface) {
            this.setInterface(iface);
        }
    }
}
