

import {Types} from "common-lib";

export class MessageHelpers {

    public static isArgTypesEqual(argTypes1:Types.Type[], argTypes2:Types.Type[]):boolean {
        if ((argTypes1 && argTypes2) && (argTypes1.length == argTypes2.length)) {
            for (var i = 0; i < argTypes1.length; i++) {
                if (argTypes1[i] != argTypes2[i]) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    public static argTypesFromStringArgTypes(value:string[]):Types.Type[] {
        if (!Array.isArray(value)) return null;
        var outArgTypes:Types.Type[] = [];
        for (var type of value) {
            if (typeof Types.StringToTypeTable[type] == "undefined") return null;
            outArgTypes.push(Types.StringToTypeTable[type]);
        }
        return outArgTypes;
    }

    public static stringArgTypesFromArgTypes(value:Types.Type[]):string[] {
        if (!Array.isArray(value)) return null;
        var outArgTypes:string[] = [];
        for (var type of value) {
            if (typeof Types.TypeToStringTable[type] == "undefined") return null;
            outArgTypes.push(Types.TypeToStringTable[type]);
        }
        return outArgTypes;
    }

}

export type MessageJson = {
    argTypes: string[];
    values: any[];
}

export class Message {
    private _argTypes:Types.Type[] = null;
    private _values:any[] = [];

    public constructor(argTypesOrJson?:Types.Type[]|string[]|MessageJson, values?:any[]) {
        if (argTypesOrJson) {
            if (Array.isArray(argTypesOrJson) && argTypesOrJson.length > 0) {
                if (typeof argTypesOrJson[0] == "string") {
                    this.setStringArgTypes(<string[]>argTypesOrJson);
                } else {
                    this.setArgTypes(<Types.Type[]>argTypesOrJson);
                }
            } else if (typeof argTypesOrJson == "object" && argTypesOrJson["argTypes"] && argTypesOrJson["values"]) {
                this.setStringArgTypes(argTypesOrJson["argTypes"]);
                this.setValues(<any[]>argTypesOrJson["values"]);
            }
        }

        if (values) {
            this.setValues(values);
        }
    }

    get argTypes():Types.Type[] {
        return this._argTypes;
    }

    public setArgTypes(value:Types.Type[]):boolean {
        // ArgTypes validation
        if (!Array.isArray(value)) return false;
        for (var type of value) {
            if (typeof Types.TypeToStringTable[type] == "undefined") return false;
        }

        this._argTypes = value;
        return true;
    }

    public setStringArgTypes(value:string[]):boolean {
        return this.setArgTypes(MessageHelpers.argTypesFromStringArgTypes(value));
    }

    get values():any[] {
        return this._values;
    }

    public setValues(value:any[]):boolean {
        if (!Array.isArray(value)) throw new Error("Message values is not array.");
        if (this._argTypes.length != value.length) throw new Error("Wrong message values length. Expected "+this._argTypes.length+" found "+value.length+".");

        for (var i = 0; i < value.length; i++) {
            switch (this._argTypes[i]) {
                case Types.Type.Boolean:
                    if (typeof value[i] != "boolean") throw new Error("Message #"+i+" value is not boolean.");
                    break;
                case Types.Type.Float:
                case Types.Type.Integer:
                    if (typeof value[i] != "number") throw new Error("Message #"+i+" value is not number.");
                    break;
                case Types.Type.String:
                    if (typeof value[i] != "string") throw new Error("Message #"+i+" value is not string.");
                    break;
                default:
                    throw new Error("Message unknown error.");
            }
        }

        this._values = value;
        return true;
    }

    public isArgTypesEqual(argTypes:Types.Type[]):boolean {
        return MessageHelpers.isArgTypesEqual(this.argTypes, argTypes);
    }

    public toJson():MessageJson {
        return {
            argTypes: MessageHelpers.stringArgTypesFromArgTypes(this.argTypes),
            values: this.values
        }
    }

    public toString():string {
        return JSON.stringify(this.toJson());
    }

}