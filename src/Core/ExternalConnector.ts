import {Block} from "./Block";
import {ConnectorEventType} from "./Connector";
import {Message, MessageHelpers} from "./Message";
import {Types} from "common-lib";

export enum ExternalConnectorType {Input, Output}

export class ExternalConnector<T extends boolean|number|Message> {
    public block:Block;
    public type:ExternalConnectorType;
    protected value:T;

    private _targetId:string;
    private _name:string;
    private _targetType: string;

    public constructor(block:Block, targetId:string, name:string, targetType: string, type:ExternalConnectorType) {
        this.block = block;
        this._targetId = targetId;
        this._name = name;
        this.type = type;
        this._targetType = targetType;
    }

    public getValue():T {
        return this.value;
    }

    public setValue(value:T):void {
        this.value = value;
        var type = ConnectorEventType.ValueChange;
        if (this instanceof ExternalMessageConnector) {
            type = ConnectorEventType.NewMessage;
        }
        if (this.type == ExternalConnectorType.Input) {
            this.block._externalInputEvent(this, type, value)
        } else {
            this.block._externalOutputEvent(this, type, value)
        }
    }

    get name():string {
        return this._name;
    }

    set name(value:string) {
        this._name = value;
    }

    get targetId():string {
        return this._targetId;
    }

    get targetType():string {
        return this.targetType;
    }
}

export class ExternalDigitalConnector extends ExternalConnector<boolean> {
    constructor(block:Block, targetId:string, name:string, targetType: string, type:ExternalConnectorType) {
        super(block, targetId, name, targetType, type);
        this.value = false;
    }
}

export class ExternalAnalogConnector extends ExternalConnector<number> {
    constructor(block:Block, targetId:string, name:string, targetType: string,  type:ExternalConnectorType) {
        super(block, targetId, name, targetType, type);
        this.value = 0;
    }
}

export class ExternalMessageConnector extends ExternalConnector<Message> {

    private _argTypes:Types.Type[];

    constructor(block:Block, targetId:string, name:string, targetType: string, type:ExternalConnectorType, argTypes:Types.Type[]) {
        super(block, targetId, name, targetType, type);
        this._argTypes = argTypes;
        this.value = null;
    }

    get argTypes():Types.Type[] {
        return this._argTypes;
    }

    public isArgTypesEqual(argTypes:Types.Type[]):boolean {
        return MessageHelpers.isArgTypesEqual(this._argTypes, argTypes);
    }


    public setValue(value:Message):void {
        // validate argTypes
        if (this.isArgTypesEqual(value.argTypes)) {
            super.setValue(value);
        }
    }
}