"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_lib_1 = require("common-lib");
class MessageHelpers {
    static isArgTypesEqual(argTypes1, argTypes2) {
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
    static argTypesFromStringArgTypes(value) {
        if (!Array.isArray(value)) {
            return null;
        }
        let outArgTypes = [];
        for (let type of value) {
            if (typeof common_lib_1.Types.StringToTypeTable[type] === 'undefined') {
                return null;
            }
            outArgTypes.push(common_lib_1.Types.StringToTypeTable[type]);
        }
        return outArgTypes;
    }
    static stringArgTypesFromArgTypes(value) {
        if (!Array.isArray(value)) {
            return null;
        }
        let outArgTypes = [];
        for (let type of value) {
            if (typeof common_lib_1.Types.TypeToStringTable[type] === 'undefined') {
                return null;
            }
            outArgTypes.push(common_lib_1.Types.TypeToStringTable[type]);
        }
        return outArgTypes;
    }
}
exports.MessageHelpers = MessageHelpers;
class Message {
    constructor(argTypesOrJson, values) {
        this._argTypes = null;
        this._values = [];
        if (argTypesOrJson) {
            if (Array.isArray(argTypesOrJson) && argTypesOrJson.length > 0) {
                if (typeof argTypesOrJson[0] === 'string') {
                    this.setStringArgTypes(argTypesOrJson);
                }
                else {
                    this.setArgTypes(argTypesOrJson);
                }
            }
            else if (typeof argTypesOrJson === 'object' && argTypesOrJson['argTypes'] && argTypesOrJson['values']) {
                this.setStringArgTypes(argTypesOrJson['argTypes']);
                this.setValues(argTypesOrJson['values']);
            }
        }
        if (values) {
            this.setValues(values);
        }
    }
    get argTypes() {
        return this._argTypes;
    }
    setArgTypes(value) {
        if (!Array.isArray(value)) {
            return false;
        }
        for (let type of value) {
            if (typeof common_lib_1.Types.TypeToStringTable[type] === 'undefined') {
                return false;
            }
        }
        this._argTypes = value;
        return true;
    }
    setStringArgTypes(value) {
        return this.setArgTypes(MessageHelpers.argTypesFromStringArgTypes(value));
    }
    get values() {
        return this._values;
    }
    setValues(value) {
        if (!Array.isArray(value)) {
            throw new Error('Message values is not array.');
        }
        if (this._argTypes.length !== value.length) {
            throw new Error('Wrong message values length. Expected ' + this._argTypes.length + ' found ' + value.length + '.');
        }
        for (let i = 0; i < value.length; i++) {
            switch (this._argTypes[i]) {
                case common_lib_1.Types.Type.Boolean:
                    if (typeof value[i] !== 'boolean') {
                        throw new Error('Message #' + i + ' value is not boolean.');
                    }
                    break;
                case common_lib_1.Types.Type.Float:
                case common_lib_1.Types.Type.Integer:
                    if (typeof value[i] !== 'number') {
                        throw new Error('Message #' + i + ' value is not number.');
                    }
                    break;
                case common_lib_1.Types.Type.String:
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
    isArgTypesEqual(argTypes) {
        return MessageHelpers.isArgTypesEqual(this.argTypes, argTypes);
    }
    toJson() {
        return {
            argTypes: MessageHelpers.stringArgTypesFromArgTypes(this.argTypes),
            values: this.values
        };
    }
    toString() {
        return JSON.stringify(this.toJson());
    }
}
exports.Message = Message;
