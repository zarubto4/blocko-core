import { Connector, ConnectorEventType } from "./Connector";
import { ExternalConnector } from './ExternalConnector';
import { ConfigProperty } from "./ConfigProperty";
import { Controller } from "./Controller";
import { Size } from "./Size";
import { Message, MessageJson } from './Message';
import { Types } from "common-lib";
export interface IBlockRenderer {
    refresh(): void;
    destroy(): void;
    getConnectorPosition(name: string): {
        x: number;
        y: number;
    };
    getPosition(): {
        x: number;
        y: number;
    };
    isHover(): boolean;
    refreshDisplayName(): any;
    highlight(): any;
}
export declare class Block {
    protected inputConnectors: Array<Connector>;
    protected outputConnectors: Array<Connector>;
    protected externalInputConnectors: Array<ExternalConnector<any>>;
    protected externalOutputsConnectors: Array<ExternalConnector<any>>;
    protected configProperties: Array<ConfigProperty>;
    protected _typeOfBlock: string;
    protected _blockVersion: string;
    protected _color: string;
    id: string;
    type: string;
    visualType: string;
    configPropertiesDescription: string;
    renderer: IBlockRenderer;
    protected _controller: Controller;
    private _x;
    private _y;
    protected _codeBlock: boolean;
    constructor(id: string, type: string, visualType: string);
    controller: Controller;
    protected afterControllerSet(): void;
    readonly codeBlock: boolean;
    x: number;
    y: number;
    sendValueToOutputConnector(connector: Connector, value: boolean | number | Message | any[]): void;
    addOutputConnector(name: string, type: Types.ConnectorType, displayName?: string, argTypes?: Types.Type[]): Connector;
    addInputConnector(name: string, type: Types.ConnectorType, displayName?: string, argTypes?: Types.Type[]): Connector;
    removeOutputConnector(connector: Connector): void;
    removeInputConnector(connector: Connector): void;
    protected addExternalInputConnector(targetId: string, name: string, type: Types.ConnectorType, argTypes?: Types.Type[], kind?: string): ExternalConnector<any>;
    protected addExternalOutputConnector(targetId: string, name: string, type: Types.ConnectorType, argTypes?: Types.Type[], kind?: string): ExternalConnector<any>;
    protected removeExternalInputConnector(connector: ExternalConnector<any>): void;
    protected removeExternalOutputConnector(connector: ExternalConnector<any>): void;
    addConfigProperty(type: Types.ConfigPropertyType, id: string, displayName: string, defaultValue: any, config?: any): ConfigProperty;
    getConfigProperties(): Array<ConfigProperty>;
    removeConfigProperty(configProperty: ConfigProperty): void;
    getInputConnectors(): Array<Connector>;
    getOutputConnectors(): Array<Connector>;
    getExternalInputConnectors(): Array<ExternalConnector<any>>;
    getExternalOutputConnectors(): Array<ExternalConnector<any>>;
    private initializationCallbacks;
    registerInitializationCallback(callback: () => void): void;
    initialize(): void;
    private outputEventCallbacks;
    registerOutputEventCallback(callback: (connector: Connector, eventType: ConnectorEventType, value: boolean | number | MessageJson) => void): void;
    _outputEvent(connector: Connector, eventType: ConnectorEventType, value: boolean | number | Message): void;
    protected outputChanged(connector: Connector, eventType: ConnectorEventType, value: boolean | number | Message): void;
    private inputEventCallbacks;
    registerInputEventCallback(callback: (connector: Connector, eventType: ConnectorEventType, value: boolean | number | MessageJson) => void): void;
    _inputEvent(connector: Connector, eventType: ConnectorEventType, value: boolean | number | Message): void;
    protected inputChanged(connector: Connector, eventType: ConnectorEventType, value: boolean | number | Message): void;
    private externalOutputEventCallbacks;
    registerExternalOutputEventCallback(callback: (connector: ExternalConnector<any>, eventType: ConnectorEventType, value: boolean | number | Message) => void): void;
    _externalOutputEvent(connector: ExternalConnector<any>, eventType: ConnectorEventType, value: boolean | number | Message): void;
    externalOutputEvent(connector: ExternalConnector<any>, eventType: ConnectorEventType, value: boolean | number | Message): void;
    private externalInputEventCallbacks;
    registerExternalInputEventCallback(callback: (connector: ExternalConnector<any>, eventType: ConnectorEventType, value: boolean | number | Message) => void): void;
    _externalInputEvent(connector: ExternalConnector<any>, eventType: ConnectorEventType, value: boolean | number | Message): void;
    externalInputEvent(connector: ExternalConnector<any>, eventType: ConnectorEventType, value: boolean | number | Message): void;
    private configChangedCallbacks;
    registerConfigChangedCallback(callback: () => void): void;
    emitConfigChanged(): void;
    getConfigData(): any;
    getConfigPropertyByName(name: string): ConfigProperty;
    setConfigData(json: any): void;
    private disconnectConnectionFromConnector(connector);
    remove(): void;
    getOutputConnectorByName(name: string): Connector;
    getInputConnectorByName(name: string): Connector;
    configChanged(): void;
    onMouseDrag(event: {
        dx: number;
        dy: number;
    }): boolean;
    onMouseClick(): void;
    onMouseDown(): void;
    onMouseUp(): void;
    rendererGetBlockBackgroundColor(): string;
    rendererGetDisplayName(): string;
    rendererGetBlockName(): string;
    rendererGetDisplayNameCursor(): string;
    rendererGetBlockSize(): Size;
    rendererCanDelete(): boolean;
    rendererShowBlockName(): boolean;
    rendererRotateDisplayName(): number;
    rendererCustomSvgPath(size: Size): string;
    rendererGetBlockDescription(): string;
    rendererGetCodeName(): string;
    rendererIsHwAttached(): boolean;
    readonly typeOfBlock: string;
    blockVersion: string;
}
