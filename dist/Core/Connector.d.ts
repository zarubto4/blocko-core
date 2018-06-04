import { Message } from './Message';
import { Block } from './Block';
import { Connection } from './Connection';
import { Types } from 'common-lib';
import { IRenderer } from './Renderer';
export declare enum ConnectorEventType {
    ValueChange = 0,
    NewMessage = 1,
    GroupInput = 2,
}
export interface ConnectorEvent {
    connector: Connector<boolean | number | Message | Object>;
    eventType: ConnectorEventType;
    value: boolean | number | Message | Object;
    interfaceId?: string;
}
export declare abstract class Connector<T extends boolean | number | Message | Object> {
    block: Block;
    renderer: IRenderer;
    connections: Array<Connection>;
    id: string;
    name: string;
    type: Types.ConnectorType;
    protected _value: T;
    constructor(block: Block, id: string, name: string, type: Types.ConnectorType);
    value: T;
    isOutput(): boolean;
    isInput(): boolean;
    isAnalog(): boolean;
    isDigital(): boolean;
    isMessage(): boolean;
    haveFreeSpace(): boolean;
    connect(target: Connector<T>): Connection;
    _removeConnection(connection: Connection): void;
    canConnect(target: Connector<T>): boolean;
    _outputSetValue(value: T, interfaceId?: string): void;
    _inputSetValue(value: T, interfaceId?: string): void;
}
export declare class DigitalConnector extends Connector<boolean> {
    constructor(block: Block, id: string, name: string, type: Types.ConnectorType);
    _outputSetValue(value: boolean, interfaceId?: string): void;
    _inputSetValue(value: boolean, interfaceId?: string): void;
}
export declare class AnalogConnector extends Connector<number> {
    constructor(block: Block, id: string, name: string, type: Types.ConnectorType);
    _outputSetValue(value: number, interfaceId?: string): void;
    _inputSetValue(value: number, interfaceId?: string): void;
}
export declare class MessageConnector extends Connector<Message> {
    argTypes: Types.Type[];
    constructor(block: Block, id: string, name: string, type: Types.ConnectorType, argTypes: Types.Type[]);
    _outputSetValue(value: Message, interfaceId?: string): void;
    _inputSetValue(value: Message, interfaceId?: string): void;
    canConnect(target: Connector<Message>): boolean;
    readonly lastMessage: Message;
    readonly stringArgTypes: string[];
}
export declare class JsonConnector extends Connector<Object> {
    constructor(block: Block, id: string, name: string, type: Types.ConnectorType);
    _outputSetValue(value: Object, interfaceId?: string): void;
    _inputSetValue(value: Object, interfaceId?: string): void;
}
