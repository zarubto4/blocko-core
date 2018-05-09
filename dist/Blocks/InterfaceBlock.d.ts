import { Size } from '../Core/Size';
import { Block, ConnectorEvent, ExternalConnectorEvent } from '../Core';
export declare enum InterfaceBlockType {
    Inputs = 0,
    Outputs = 1,
}
export interface BlockoTargetInterface {
    code?: {
        programId: string;
        versionId: string;
    };
    grid?: {
        projectId: string;
        programs: Array<{
            programId: string;
            versionId: string;
        }>;
    };
    displayName: string;
    color: string;
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
    private _interface;
    constructor(id: string, type: string, visualType: string, interfaceType: InterfaceBlockType);
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
    remove(): void;
    isInterface(): boolean;
    rendererGetBlockSize(): Size;
    rendererShowBlockName(): boolean;
    rendererCanDelete(): boolean;
    rendererGetDisplayName(): string;
    rendererRotateDisplayName(): number;
    rendererGetBlockBackgroundColor(): string;
    rendererCustomSvgPath(size: Size): string;
    rendererIsHwAttached(): boolean;
}
export declare class InputsInterfaceBlock extends BaseInterfaceBlock {
    constructor(id: string, iface?: any);
}
export declare class OutputsInterfaceBlock extends BaseInterfaceBlock {
    constructor(id: string, iface?: any);
}
