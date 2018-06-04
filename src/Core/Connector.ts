import { Message, MessageHelpers } from './Message';
import { Block } from './Block';
import { Connection } from './Connection';
import { Types } from 'common-lib';
import { HighlightType, IRenderer } from './Renderer';

export enum ConnectorEventType { ValueChange, NewMessage, GroupInput }

export interface ConnectorEvent {
    connector: Connector<boolean|number|Message|Object>;
    eventType: ConnectorEventType;
    value: boolean|number|Message|Object;
    interfaceId?: string;
}

export abstract class Connector<T extends boolean|number|Message|Object> {

    public block: Block;
    public renderer: IRenderer;
    public connections: Array<Connection>;

    public id: string;
    public name: string;
    public type: Types.ConnectorType;
    protected _value: T;

    public constructor(block: Block, id: string, name: string, type: Types.ConnectorType) {
        this.connections = [];
        this.block = block;
        this.id = id;
        this.name = name;
        this.type = type;
    }

    public get value(): T {
        return this._value;
    }

    public set value(value: T) {
        this._value = value;
    }

    public isOutput():boolean {
        return this.type == Types.ConnectorType.DigitalOutput || this.type == Types.ConnectorType.AnalogOutput || this.type == Types.ConnectorType.MessageOutput || this.type == Types.ConnectorType.JsonOutput;
    }

    public isInput():boolean {
        return this.type == Types.ConnectorType.DigitalInput || this.type == Types.ConnectorType.AnalogInput || this.type == Types.ConnectorType.MessageInput || this.type == Types.ConnectorType.JsonInput;
    }

    public isAnalog():boolean {
        return this.type == Types.ConnectorType.AnalogOutput || this.type == Types.ConnectorType.AnalogInput;
    }

    public isDigital():boolean {
        return this.type == Types.ConnectorType.DigitalOutput || this.type == Types.ConnectorType.DigitalInput;
    }

    public isMessage():boolean {
        return this.type == Types.ConnectorType.MessageInput || this.type == Types.ConnectorType.MessageOutput || this.type == Types.ConnectorType.JsonInput || this.type == Types.ConnectorType.JsonOutput;
    }

    // have this connector free space to connect another connection
    public haveFreeSpace():boolean {
        if (this.type == Types.ConnectorType.DigitalInput || this.type == Types.ConnectorType.AnalogInput) {
            return (this.connections.length == 0);
        }
        return true; // Other types have always free space
    }

    public connect(target: Connector<T>): Connection {
        if (this.canConnect(target)) {
            let connection: Connection = new Connection(this, target);
            this.connections.push(connection);
            target.connections.push(connection);

            if (this.block && this.block.controller) {
                this.block.controller._addConnection(connection);
            }

            return connection;
        }
        return null;
    }

    public _removeConnection(connection: Connection) {
        let index = this.connections.indexOf(connection);
        if (index > -1) {
            this.connections.splice(index, 1);
        }
    }

    public canConnect(target: Connector<T>): boolean {
        if (this.block == target.block) { // cannot connect same block
            return false;
        }

        if (!this.haveFreeSpace() || !target.haveFreeSpace()) { // if dont have free space cannot connect
            return false;
        }

        if (this.isInput() && target.isInput()) { // cannot connect two inputs
            return false;
        }

        if (this.isOutput() && target.isOutput()) { // cannot connect two outputs
            return false;
        }

        if (!((this.isAnalog() && target.isAnalog()) || (this.isDigital() && target.isDigital()) || (this.isMessage() && target.isMessage()))) { // cannot connect incorrect types
            return false;
        }

        return true;

        // TODO: ignorovat stejnou konexi
    }

    // This is 'inner' method, call it only if you know what you do!!
    public _outputSetValue(value: T, interfaceId?: string) {
        if (this.isOutput()) {

            let type: ConnectorEventType = ConnectorEventType.ValueChange;

            if (this.type === Types.ConnectorType.MessageInput || this.type === Types.ConnectorType.MessageOutput || this.type === Types.ConnectorType.JsonInput || this.type === Types.ConnectorType.JsonOutput) {
                type = ConnectorEventType.NewMessage;
            }

            if (interfaceId) {
                type = ConnectorEventType.GroupInput;
            }

            this.block._outputEvent({
                connector: this,
                eventType: type,
                value: value,
                interfaceId: interfaceId
            });
        } else {
            console.error('Connector::_outputSetValue - attempt to set input value on output connector');
        }
    }

    // This is 'inner' method, call it only if you know what you do!!
    public _inputSetValue(value: T, interfaceId?: string) {
        if (this.isInput()) {
            let type: ConnectorEventType = ConnectorEventType.ValueChange;

            if (this.type === Types.ConnectorType.MessageInput || this.type === Types.ConnectorType.MessageOutput || this.type === Types.ConnectorType.JsonInput || this.type === Types.ConnectorType.JsonOutput) {
                type = ConnectorEventType.NewMessage;
            }

            if (interfaceId) {
                type = ConnectorEventType.GroupInput;
            }

            this.block._inputEvent({
                connector: this,
                eventType: type,
                value: value,
                interfaceId: interfaceId
            });
        } else {
            console.error('Connector::_inputSetValue - attempt to set output value on input connector');
        }
    }
}

/**
 * Digital connector
 */
export class DigitalConnector extends Connector<boolean> {

    public constructor(block: Block, id: string, name: string, type: Types.ConnectorType) {
        super(block, id, name, type);
    }

    public _outputSetValue(value: boolean, interfaceId?: string): void {
        if (typeof value === 'boolean') {
            super._outputSetValue(value, interfaceId);
        }
    }

    public _inputSetValue(value: boolean, interfaceId?: string): void {
        if (typeof value === 'boolean') {
            super._inputSetValue(value, interfaceId);
        }
    }
}

/**
 * Analog connector
 */
export class AnalogConnector extends Connector<number> {

    public constructor(block: Block, id: string, name: string, type: Types.ConnectorType) {
        super(block, id, name, type);
    }

    public _outputSetValue(value: number, interfaceId?: string): void {
        if (typeof value === 'number') {
            super._outputSetValue(value, interfaceId);
        }
    }

    public _inputSetValue(value: number, interfaceId?: string): void {
        if (typeof value === 'number') {
            super._inputSetValue(value, interfaceId);
        }
    }
}

/**
 * Message connector
 */
export class MessageConnector extends Connector<Message> {

    public argTypes: Types.Type[] = null;

    public constructor(block: Block, id: string, name: string, type: Types.ConnectorType, argTypes: Types.Type[]) {
        super(block, id, name, type);
        this.argTypes = argTypes;
    }

    public _outputSetValue(value: Message, interfaceId?: string): void {
        if (value instanceof Message && value.isArgTypesEqual(this.argTypes)) {

            if (this.renderer) {
                this.renderer.highlight(HighlightType.Message);
            }
            this.connections.forEach(connection => {
                if (connection.renderer) {
                    connection.renderer.highlight(HighlightType.Message);
                }
            });

            super._outputSetValue(value, interfaceId);
        }
    }

    public _inputSetValue(value: Message, interfaceId?: string): void {
        if (value instanceof Message && value.isArgTypesEqual(this.argTypes)) {
            super._inputSetValue(value, interfaceId);
        }
    }

    public canConnect(target: Connector<Message>): boolean {

        return super.canConnect(target) && MessageHelpers.isArgTypesEqual(this.argTypes, (<MessageConnector>target).argTypes)
    }

    get lastMessage(): Message {
        return this.value;
    }

    get stringArgTypes(): string[] {
        let out:string[] = [];
        if (this.argTypes) {
            this.argTypes.forEach((argType:Types.Type) => {
                out.push(Types.TypeToStringTable[argType]);
            });
        }
        return out;
    }
}

/**
 * Json connector
 */
export class JsonConnector extends Connector<Object> {

    public constructor(block: Block, id: string, name: string, type: Types.ConnectorType) {
        super(block, id, name, type);
    }

    public _outputSetValue(value: Object, interfaceId?: string): void {
        if (typeof value === 'object') {
            super._outputSetValue(value, interfaceId);
        }
    }

    public _inputSetValue(value: Object, interfaceId?: string): void {
        if (typeof value === 'object') {
            super._inputSetValue(value, interfaceId);
        }
    }
}