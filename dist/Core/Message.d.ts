import { Types } from 'common-lib';
export declare class MessageHelpers {
    static isArgTypesEqual(argTypes1: Types.Type[], argTypes2: Types.Type[]): boolean;
    static argTypesFromStringArgTypes(value: Array<string>): Array<Types.Type>;
    static stringArgTypesFromArgTypes(value: Array<Types.Type>): Array<string>;
}
export declare type MessageJson = {
    argTypes: Array<string>;
    values: Array<boolean | number | string>;
};
export declare class Message {
    private _argTypes;
    private _values;
    constructor(argTypesOrJson?: Array<Types.Type> | Array<string> | MessageJson, values?: Array<boolean | number | string>);
    readonly argTypes: Array<Types.Type>;
    setArgTypes(value: Array<Types.Type>): boolean;
    setStringArgTypes(value: Array<string>): boolean;
    readonly values: Array<boolean | number | string>;
    setValues(value: Array<boolean | number | string>): boolean;
    isArgTypesEqual(argTypes: Array<Types.Type>): boolean;
    toJson(): MessageJson;
    toString(): string;
}
