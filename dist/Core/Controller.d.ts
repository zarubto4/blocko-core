import { Block } from './Block';
import { Connection } from './Connection';
import { BlockClass, BlockRegistration } from './BlockRegistration';
import { Connector, ConnectorEventType } from './Connector';
import { ServicesHandler } from '../Blocks/Libraries/ServiceLib';
import { Service } from '../Blocks/Services/Service';
import { ExternalConnector } from './ExternalConnector';
import { BlockoTargetInterface } from '../Blocks/InterfaceBlock';
import { Message, MessageJson } from './Message';
import { BaseInterfaceBlock } from '../Blocks';
import { Events } from 'common-lib';
import { BlockAddedEvent, BlockRemovedEvent, ConnectionAddedEvent, ConnectionRemovedEvent } from './Events';
export interface BlockoInstanceConfig {
    dbConnectionString?: string;
    inputEnabled?: boolean;
    outputEnabled?: boolean;
    asyncEventsEnabled?: boolean;
}
export interface BoundInterface {
    targetId: string;
    interfaceId: string;
    group?: boolean;
}
export declare class Controller extends Events.Emitter<BlockAddedEvent | BlockRemovedEvent | ConnectionAddedEvent | ConnectionRemovedEvent> {
    blocksRegister: Array<BlockRegistration>;
    blocks: Array<Block>;
    connections: Array<Connection>;
    safeRun: boolean;
    gui: boolean;
    configuration: BlockoInstanceConfig;
    protected _servicesHandler: ServicesHandler;
    constructor(configuration?: BlockoInstanceConfig);
    registerService(service: Service): void;
    readonly servicesHandler: ServicesHandler;
    registerBlocks(blocksClass: Array<BlockClass>): void;
    registerBlock(blockClass: BlockClass): void;
    getBlockClassByType(type: string): BlockClass;
    private blockAddedCallbacks;
    registerBlockAddedCallback(callback: (block: Block) => void): void;
    addBlock(block: Block): void;
    private connectionAddedCallbacks;
    registerConnectionAddedCallback(callback: (connection: Connection) => void): void;
    _addConnection(connection: Connection): void;
    private connectionRemovedCallbacks;
    registerConnectionRemovedCallback(callback: (connection: Connection) => void): void;
    _removeConnection(connection: Connection): void;
    private blockRemovedCallbacks;
    registerBlockRemovedCallback(callback: (block: Block) => void): void;
    _removeBlock(block: Block): void;
    removeAllBlocks(): void;
    getBlockById(id: string): Block;
    private blockIndex;
    getFreeBlockId(): string;
    private interfaceIndex;
    getInterfaceBlockId(): string;
    private inputConnectorEventCallbacks;
    registerInputConnectorEventCallback(callback: (block: Block, connector: Connector<boolean | number | object | Message>, eventType: ConnectorEventType, value: boolean | number | MessageJson) => void): void;
    private outputConnectorEventCallbacks;
    registerOutputConnectorEventCallback(callback: (block: Block, connector: Connector<boolean | number | object | Message>, eventType: ConnectorEventType, value: boolean | number | MessageJson) => void): void;
    private externalInputConnectorEventCallbacks;
    registerExternalInputConnectorEventCallback(callback: (block: Block, connector: ExternalConnector<any>, eventType: ConnectorEventType, value: boolean | number | Message) => void): void;
    private externalOutputConnectorEventCallbacks;
    registerExternalOutputConnectorEventCallback(callback: (block: Block, connector: ExternalConnector<any>, eventType: ConnectorEventType, value: boolean | number | Message) => void): void;
    private inputConnectorEvent(connector, eventType, value);
    private outputConnectorEvent(connector, eventType, value);
    private externalInputConnectorEvent(connector, eventType, value);
    private externalOutputConnectorEvent(connector, eventType, value);
    private errorCallbacks;
    registerErrorCallback(callback: (block: Block, error: any) => void): void;
    _emitError(block: Block, error: any): void;
    private logCallbacks;
    registerLogCallback(callback: (block: Block, type: string, message: any) => void): void;
    _emitLog(block: Block, type: string, message: any): void;
    setDigitalValue(targetId: string, groupIds: string[], name: string, value: boolean): void;
    setAnalogValue(targetId: string, groupIds: string[], name: string, value: number): void;
    setMessageValue(targetId: string, groupIds: string[], name: string, message: Message): void;
    setWebHookValue(blockId: string, message: object): boolean;
    setInputConnectorValue(blockId: string, connectorName: string, value: boolean | number | Message): void;
    setOutputConnectorValue(blockId: string, connectorName: string, value: boolean | number | Message): void;
    getDigitalInputNames(): Array<any>;
    getAnalogInputNames(): Array<any>;
    getMessageInputNames(): Array<any>;
    getDigitalOutputNames(): Array<string>;
    getAnalogOutputNames(): Array<string>;
    getMessageOutputNames(): Array<string>;
    getWebHooks(): Array<string>;
    setError(blockId: string, enabled: boolean): void;
    addInterface(iface: BlockoTargetInterface): void;
    bindInterface(block: BaseInterfaceBlock, targetId: string, group?: boolean): BoundInterface;
    getBindings(): Array<BoundInterface>;
    protected hardwareRestartCallback: (targetId: string) => void;
    registerHardwareRestartCallback(callback: (targetId: string) => void): void;
    callHardwareRestartCallback(targetId: string): void;
    setHardwareNetworkStatus(targetId: string, groupIds: Array<string>, online: boolean): void;
    getDataJson(): object;
    setDataJson(data: object): string;
    isDeployable(): boolean;
}
