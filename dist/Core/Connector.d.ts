import { Message } from './Message';
import { Block } from './Block';
import { Connection } from './Connection';
import { Types, Events } from 'common-lib';
import { IOEvent } from './Events';
export declare enum ConnectorEventType {
    ValueChange = 0,
    NewMessage = 1,
    GroupInput = 2,
}
export interface ConnectorEvent {
    connector: Connector<boolean | number | object | Message>;
    eventType: ConnectorEventType;
    value: boolean | number | object | Message;
    interfaceId?: string;
}
export declare abstract class Connector<T extends boolean | number | object | Message> extends Events.Emitter<IOEvent> {
    block: Block;
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
    isJson(): boolean;
    haveFreeSpace(): boolean;
    connect(target: Connector<T>): Connection;
    _removeConnection(connection: Connection): void;
    canConnect(target: Connector<T>): boolean;
    _outputSetValue(value: T, interfaceId?: string, group?: boolean): void;
    _inputSetValue(value: T, interfaceId?: string, group?: boolean): void;
}
export declare class DigitalConnector extends Connector<boolean> {
    constructor(block: Block, id: string, name: string, type: Types.ConnectorType);
    _outputSetValue(value: boolean, interfaceId?: string, group?: boolean): void;
    _inputSetValue(value: boolean, interfaceId?: string, group?: boolean): void;
    isDigital(): boolean;
}
export declare class AnalogConnector extends Connector<number> {
    constructor(block: Block, id: string, name: string, type: Types.ConnectorType);
    _outputSetValue(value: number, interfaceId?: string, group?: boolean): void;
    _inputSetValue(value: number, interfaceId?: string, group?: boolean): void;
    isAnalog(): boolean;
}
export declare class MessageConnector extends Connector<Message> {
    argTypes: Types.Type[];
    constructor(block: Block, id: string, name: string, type: Types.ConnectorType, argTypes: Types.Type[]);
    _outputSetValue(value: Message, interfaceId?: string, group?: boolean): void;
    _inputSetValue(value: Message, interfaceId?: string, group?: boolean): void;
    isMessage(): boolean;
    canConnect(target: Connector<Message>): boolean;
    readonly stringArgTypes: Array<string>;
}
export declare class JsonConnector extends Connector<object> {
    constructor(block: Block, id: string, name: string, type: Types.ConnectorType);
    _outputSetValue(value: object, interfaceId?: string, group?: boolean): void;
    _inputSetValue(value: object, interfaceId?: string, group?: boolean): void;
    isJson(): boolean;
}
