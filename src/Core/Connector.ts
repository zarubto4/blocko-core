

import {Connection} from './Connection';
import {Block} from './Block';
import {Message, MessageHelpers} from './Message';
import {Types} from 'common-lib';

export interface IConnectorRenderer {
    refresh():void;
    destroy():void;
    messageHighlight():void;
}

// Conntector types
export enum ConnectorEventType {ValueChange, NewMessage}

export class Connector {
    public block:Block;
    public name:string;
    public displayName:string;
    public type:Types.ConnectorType;
    private _numValue:number = 0;
    private _boolValue:boolean = false;
    private _msgValue:Message = null;

    public connections:Array<Connection>;

    public argTypes:Types.Type[] = null;

    public renderer:IConnectorRenderer;

    public constructor(block:Block, name:string, displayName:string, type:Types.ConnectorType, argTypes:Types.Type[]) {
        this.connections = [];
        this.block = block;
        this.name = name;
        this.displayName = displayName;
        this.type = type;

        this.argTypes = argTypes;
    }

    get value():number|boolean {
        if (this.isDigital()) {
            return this._boolValue;
        }
        if (this.isAnalog()) {
            return this._numValue
        }
        return null;
    }

    get lastMessage():Message {
        return this._msgValue;
    }

    set value(value:number|boolean) {
        if (this.isDigital()) {
            if (typeof value == 'boolean') {
                this._boolValue = <boolean>value;
            } else if (typeof value == 'number') {
                this._boolValue = value?true:false;
            }
        }
        if (this.isAnalog()) {
            if (typeof value == 'boolean') {
                this._numValue = value?1:0;
            } else if (typeof value == 'number') {
                this._numValue = <number>value;
            }
        }
        return;
    }

    public connect(target:Connector):Connection {
        if (this.canConnect(target)) {
            let connection:Connection = new Connection(this, target);
            this.connections.push(connection);
            target.connections.push(connection);

            if (this.block && this.block.controller) {
                this.block.controller._addConnection(connection);
            }

            return connection;
        }
        return null;
    }

    public _removeConnection(connection:Connection) {
        let index = this.connections.indexOf(connection);
        if (index > -1) {
            this.connections.splice(index, 1);
        }
    }

    public canConnect(target:Connector):boolean {
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

        if (this.isMessage()) {
            return MessageHelpers.isArgTypesEqual(this.argTypes, target.argTypes);
        }

        return true;

        // TODO: ignorovat stejnou konexi
    }

    public isOutput():boolean {
        return (this.type == Types.ConnectorType.DigitalOutput) || (this.type == Types.ConnectorType.AnalogOutput) || (this.type == Types.ConnectorType.MessageOutput);
    }

    public isInput():boolean {
        return (this.type == Types.ConnectorType.DigitalInput) || (this.type == Types.ConnectorType.AnalogInput) || (this.type == Types.ConnectorType.MessageInput);
    }

    public isAnalog():boolean {
        return (this.type == Types.ConnectorType.AnalogOutput) || (this.type == Types.ConnectorType.AnalogInput);
    }

    public isDigital():boolean {
        return (this.type == Types.ConnectorType.DigitalOutput) || (this.type == Types.ConnectorType.DigitalInput);
    }

    public isMessage():boolean {
        return (this.type == Types.ConnectorType.MessageInput) || (this.type == Types.ConnectorType.MessageOutput);
    }

    // have this connector free space to connect another connection
    public haveFreeSpace():boolean {
        if (this.type == Types.ConnectorType.DigitalInput || this.type == Types.ConnectorType.AnalogInput) {
            return (this.connections.length == 0);
        }
        return true; // Other types have always free space
    }


    get stringArgTypes():string[] {
        let out:string[] = [];
        if (this.argTypes) {
            this.argTypes.forEach((argType:Types.Type) => {
                out.push(Types.TypeToStringTable[argType]);
            });
        }
        return out;
    }

// This is 'inner' method, call it only if you know what you do!!
    public _outputSetValue(value:boolean|number|Message|any[]) {

        let boolVal:boolean = null;
        let numVal:number = null;
        let msgVal:Message = null;
        if (typeof value == 'boolean') {
            boolVal = <boolean>value;
            numVal = boolVal?1:0;
        }
        if (typeof value == 'number') {
            numVal = <number>value;
            boolVal = !!numVal;
        }
        if (Array.isArray(value)) {
            msgVal = new Message(this.argTypes, value);
        }
        if (value instanceof Message) {
            msgVal = <Message>value;
        }

        if (this.type == Types.ConnectorType.DigitalOutput) {
            if (boolVal == null) return;
            if (this._boolValue == boolVal) return;
            this._boolValue = boolVal;
            this.block._outputEvent(this, ConnectorEventType.ValueChange, boolVal);
            return;
        } else if (this.type == Types.ConnectorType.AnalogOutput) {
            if (numVal == null) return;
            if (this._numValue == numVal) return;
            this._numValue = numVal;
            this.block._outputEvent(this, ConnectorEventType.ValueChange, numVal);
            return;
        } else if (this.type == Types.ConnectorType.MessageOutput) {
            if (msgVal == null) return;
            if (!msgVal.isArgTypesEqual(this.argTypes)) return;
            // TODO: check if highlight needed here
            if (this.renderer) {
                this.renderer.messageHighlight();
            }
            this.connections.forEach(connection => {
                if (connection.renderer) {
                    connection.renderer.messageHighlight();
                }
            });
            this._msgValue = msgVal;
            this.block._outputEvent(this, ConnectorEventType.NewMessage, msgVal);
            return;
        }
        console.log('Cannot call setValue on not-output connectors!');
    }

    // This is 'inner' method, call it only if you know what you do!!
    public _inputSetValue(value:boolean|number|Message) {

        let boolVal:boolean = null;
        let numVal:number = null;
        let msgVal:Message = null;
        if (typeof value == 'boolean') {
            boolVal = <boolean>value;
            numVal = boolVal?1:0;
        }
        if (typeof value == 'number') {
            numVal = <number>value;
            boolVal = !!numVal;
        }
        if (value instanceof Message) msgVal = <Message>value;

        if (this.type == Types.ConnectorType.DigitalInput) {
            if (boolVal == null) return;
            if (this._boolValue == boolVal) return;
            this._boolValue = boolVal;
            this.block._inputEvent(this, ConnectorEventType.ValueChange, boolVal);
            return;
        } else if (this.type == Types.ConnectorType.AnalogInput) {
            if (numVal == null) return;
            if (this._numValue == numVal) return;
            this._numValue = numVal;
            this.block._inputEvent(this, ConnectorEventType.ValueChange, numVal);
            return;
        } else if (this.type == Types.ConnectorType.MessageInput) {
            if (!msgVal) return;
            if (msgVal.isArgTypesEqual(this.argTypes)) {
                // TODO: check if highlight needed here
                if (this.renderer) {
                    this.renderer.messageHighlight();
                }
                this._msgValue = msgVal;
                this.block._inputEvent(this, ConnectorEventType.NewMessage, msgVal);
            }
            return;
        }
        console.log('Cannot call _inputSetValue on not-inputs connectors!');
    }
}