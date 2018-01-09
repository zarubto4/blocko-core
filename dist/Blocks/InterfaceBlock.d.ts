import * as Core from '../Core/index';
import { Connector, ConnectorEventType } from "../Core/Connector";
import { Size } from "../Core/Size";
import { ExternalConnector } from "../Core/ExternalConnector";
import { Message } from "../Core/Message";
export declare enum InterfaceBlockType {
    Inputs = 0,
    Outputs = 1,
}
export interface BlockoTargetInterface {
    targetId: string;
    displayName: string;
    color: string;
    pos_x?: number;
    pos_y?: number;
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
export declare abstract class BaseInterfaceBlock extends Core.Block {
    private _color;
    private _displayName;
    private _targetId;
    private _interfaceType;
    private _deviceInputsCount;
    private _deviceOutputsCount;
    private _interface;
    constructor(id: string, type: string, visualType: string, interfaceType: InterfaceBlockType);
    setInterface(iface: BlockoTargetInterface): void;
    readonly interface: any;
    readonly targetId: string;
    externalInputEvent(connector: ExternalConnector<any>, eventType: ConnectorEventType, value: boolean | number | Message): void;
    inputChanged(connector: Connector, eventType: ConnectorEventType, value: boolean | number | Message): void;
    rendererGetBlockSize(): Size;
    rendererShowBlockName(): boolean;
    rendererCanDelete(): boolean;
    rendererGetDisplayName(): string;
    rendererRotateDisplayName(): number;
    rendererGetBlockBackgroundColor(): string;
    rendererCustomSvgPath(size: Size): string;
}
export declare class InputsInterfaceBlock extends BaseInterfaceBlock {
    constructor(id: string, iface?: any);
}
export declare class OutputsInterfaceBlock extends BaseInterfaceBlock {
    constructor(id: string, iface?: any);
}
