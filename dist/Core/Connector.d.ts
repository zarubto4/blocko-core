import { Connection } from './Connection';
import { Block } from './Block';
import { Message } from './Message';
import { Types } from 'common-lib';
export interface IConnectorRenderer {
    refresh(): void;
    destroy(): void;
    messageHighlight(): void;
}
export declare enum ConnectorEventType {
    ValueChange = 0,
    NewMessage = 1,
    GroupInput = 2,
}
export interface ConnectorEvent {
    connector: Connector;
    eventType: ConnectorEventType;
    value: boolean | number | Message;
    interfaceId?: string;
}
export declare class Connector {
    block: Block;
    name: string;
    displayName: string;
    type: Types.ConnectorType;
    private _numValue;
    private _boolValue;
    private _msgValue;
    connections: Array<Connection>;
    argTypes: Types.Type[];
    renderer: IConnectorRenderer;
    constructor(block: Block, name: string, displayName: string, type: Types.ConnectorType, argTypes: Types.Type[]);
    value: number | boolean;
    readonly lastMessage: Message;
    connect(target: Connector): Connection;
    _removeConnection(connection: Connection): void;
    canConnect(target: Connector): boolean;
    isOutput(): boolean;
    isInput(): boolean;
    isAnalog(): boolean;
    isDigital(): boolean;
    isMessage(): boolean;
    haveFreeSpace(): boolean;
    readonly stringArgTypes: string[];
    _outputSetValue(value: boolean | number | Message | any[], interfaceId?: string): void;
    _inputSetValue(value: boolean | number | Message, interfaceId?: string): void;
}
