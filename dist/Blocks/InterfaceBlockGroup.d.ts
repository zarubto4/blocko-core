import * as Core from '../Core/index';
import { Connector, ConnectorEventType } from '../Core/Connector';
import { Size } from '../Core/Size';
import { ExternalConnector } from '../Core/ExternalConnector';
import { Message } from '../Core/Message';
import { InterfaceBlockType } from './InterfaceBlock';
import { BlockoTargetInterface } from './index';
export declare abstract class BaseInterfaceBlockGroup extends Core.Block {
    private _color;
    private _displayName;
    private _targetId;
    private _interface;
    private _interfaceType;
    private _deviceInputsCount;
    private _deviceOutputsCount;
    constructor(id: string, type: string, visualType: string, interfaceType: InterfaceBlockType);
    setInterface(iface: BlockoTargetInterface): void;
    readonly interface: any;
    readonly targetId: string;
    externalInputEvent(connector: ExternalConnector<any>, eventType: ConnectorEventType, value: boolean | number | Message): void;
    inputChanged(connector: Connector, eventType: ConnectorEventType, value: boolean | number | Message): void;
    remove(): void;
    rendererGetBlockSize(): Size;
    rendererShowBlockName(): boolean;
    rendererCanDelete(): boolean;
    rendererGetDisplayName(): string;
    rendererRotateDisplayName(): number;
    rendererGetBlockBackgroundColor(): string;
    rendererCustomSvgPath(size: Size): string;
}
export declare class InputsInterfaceBlockGroup extends BaseInterfaceBlockGroup {
    constructor(id: string, iface?: any);
}
export declare class OutputsInterfaceBlockGroup extends BaseInterfaceBlockGroup {
    constructor(id: string, iface?: any);
}
