import { Block, ConnectorEvent, DigitalConnector, ExternalConnectorEvent } from '../Core';
import { BoundInterface } from '../Core/Controller';
export declare enum InterfaceBlockType {
    Inputs = 0,
    Outputs = 1,
}
export interface BlockoTargetInterface {
    code?: {
        programId: string;
        programName: string;
        versionId: string;
        versionName: string;
        versionDescription: string;
    };
    grid?: {
        projectId: string;
        projectName: string;
        programs: Array<{
            programId: string;
            programName: string;
            versionId: string;
            versionName: string;
        }>;
    };
    interface: {
        digitalInputs?: {
            [name: string]: any;
        };
        digitalOutputs?: {
            [name: string]: any;
        };
        analogInputs?: {
            [name: string]: any;
        };
        analogOutputs?: {
            [name: string]: any;
        };
        messageInputs?: {
            [name: string]: any;
        };
        messageOutputs?: {
            [name: string]: any;
        };
    };
}
export declare abstract class BaseInterfaceBlock extends Block {
    private _displayName;
    private _targetId;
    private _interfaceId;
    private _group;
    private _interfaceType;
    private _deviceInputsCount;
    private _deviceOutputsCount;
    protected _interface: BlockoTargetInterface;
    protected restartDeviceInput: DigitalConnector;
    protected networkStatusOutput: DigitalConnector;
    constructor(id: string, type: string, interfaceType: InterfaceBlockType);
    initialize(): void;
    getDataJson(): object;
    setDataJson(data: object): void;
    setInterface(iface: BlockoTargetInterface): void;
    setTargetId(targetId: string): void;
    readonly interface: BlockoTargetInterface;
    readonly targetId: string;
    readonly interfaceId: string;
    group: boolean;
    getOther(): BaseInterfaceBlock;
    isInput(): boolean;
    isGrid(): boolean;
    externalInputEvent(event: ExternalConnectorEvent): void;
    inputChanged(event: ConnectorEvent): void;
    getRestartDeviceInput(): DigitalConnector;
    getNetworkStatusOutput(): DigitalConnector;
    bindInterface(targetId: string, group?: boolean): BoundInterface;
    remove(): void;
    isInterface(): boolean;
}
export declare class InputsInterfaceBlock extends BaseInterfaceBlock {
    constructor(id: string, iface?: any);
}
export declare class OutputsInterfaceBlock extends BaseInterfaceBlock {
    constructor(id: string, iface?: any);
}
