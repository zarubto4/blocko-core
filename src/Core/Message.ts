import { Types } from 'common-lib';

export class MessageHelpers {

    public static isArgTypesEqual(argTypes1: Types.Type[], argTypes2: Types.Type[]): boolean {
        if ((argTypes1 && argTypes2) && (argTypes1.length === argTypes2.length)) {
            for (let i = 0; i < argTypes1.length; i++) {
                if (argTypes1[i] !== argTypes2[i]) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    public static argTypesFromStringArgTypes(value: Array<string>): Array<Types.Type> {
        if (!Array.isArray(value)) {
            return null;
        }
        let outArgTypes: Array<Types.Type> = [];
        for (let type of value) {
            if (typeof Types.StringToTypeTable[type] === 'undefined') {
                return null;
            }
            outArgTypes.push(Types.StringToTypeTable[type]);
        }
        return outArgTypes;
    }

    public static stringArgTypesFromArgTypes(value: Array<Types.Type>): Array<string> {
        if (!Array.isArray(value)) {
            return null;
        }
        let outArgTypes: Array<string> = [];
        for (let type of value) {
            if (typeof Types.TypeToStringTable[type] === 'undefined') {
                return null;
            }
            outArgTypes.push(Types.TypeToStringTable[type]);
        }
        return outArgTypes;
    }

}

export type MessageJson = {
    argTypes: Array<string>;
    values: Array<boolean|number|string>;
}

export class Message {
    private _argTypes: Array<Types.Type> = null;
    private _values: Array<boolean|number|string> = [];

    public constructor(argTypesOrJson?: Array<Types.Type>|Array<string>|MessageJson, values?: Array<boolean|number|string>) {
        if (argTypesOrJson) {
            if (Array.isArray(argTypesOrJson) && argTypesOrJson.length > 0) {
                if (typeof argTypesOrJson[0] === 'string') {
                    this.setStringArgTypes(<Array<string>>argTypesOrJson);
                } else {
                    this.setArgTypes(<Array<Types.Type>>argTypesOrJson);
                }
            } else if (typeof argTypesOrJson === 'object' && argTypesOrJson['argTypes'] && argTypesOrJson['values']) {
                this.setStringArgTypes(argTypesOrJson['argTypes']);
                this.setValues(<Array<boolean|number|string>>argTypesOrJson['values']);
            }
        }

        if (values) {
            this.setValues(values);
        }
    }

    get argTypes(): Array<Types.Type> {
        return this._argTypes;
    }

    public setArgTypes(value: Array<Types.Type>): boolean {
        // ArgTypes validation
        if (!Array.isArray(value)) {
            return false;
        }
        for (let type of value) {
            if (typeof Types.TypeToStringTable[type] === 'undefined') {
                return false;
            }
        }

        this._argTypes = value;
        return true;
    }

    public setStringArgTypes(value: Array<string>): boolean {
        return this.setArgTypes(MessageHelpers.argTypesFromStringArgTypes(value));
    }

    get values(): Array<boolean|number|string> {
        return this._values;
    }

    public setValues(value: Array<boolean|number|string>): boolean {
        if (!Array.isArray(value)) {
            throw new Error('Message values is not array.');
        }
        if (this._argTypes.length !== value.length) {
            throw new Error('Wrong message values length. Expected ' + this._argTypes.length + ' found ' + value.length + '.');
        }

        for (let i = 0; i < value.length; i++) {
            switch (this._argTypes[i]) {
                case Types.Type.Boolean:
                    if (typeof value[i] !== 'boolean') {
                        throw new Error('Message #' + i + ' value is not boolean.');
                    }
                    break;
                case Types.Type.Float:
                case Types.Type.Integer:
                    if (typeof value[i] !== 'number') {
                        throw new Error('Message #' + i + ' value is not number.');
                    }
                    break;
                case Types.Type.String:
                    if (typeof value[i] !== 'string') {
                        throw new Error('Message #' + i + ' value is not string.');
                    }
                    break;
                default:
                    throw new Error('Message unknown error.');
            }
        }

        this._values = value;
        return true;
    }

    public isArgTypesEqual(argTypes: Array<Types.Type>): boolean {
        return MessageHelpers.isArgTypesEqual(this.argTypes, argTypes);
    }

    public toJson(): MessageJson {
        return {
            argTypes: MessageHelpers.stringArgTypesFromArgTypes(this.argTypes),
            values: this.values
        }
    }

    public toString(): string {
        return JSON.stringify(this.toJson());
    }
}
