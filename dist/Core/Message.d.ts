import { Types } from "common-lib";
export declare class MessageHelpers {
    static isArgTypesEqual(argTypes1: Types.Type[], argTypes2: Types.Type[]): boolean;
    static argTypesFromStringArgTypes(value: string[]): Types.Type[];
    static stringArgTypesFromArgTypes(value: Types.Type[]): string[];
}
export declare type MessageJson = {
    argTypes: string[];
    values: any[];
};
export declare class Message {
    private _argTypes;
    private _values;
    constructor(argTypesOrJson?: Types.Type[] | string[] | MessageJson, values?: any[]);
    readonly argTypes: Types.Type[];
    setArgTypes(value: Types.Type[]): boolean;
    setStringArgTypes(value: string[]): boolean;
    readonly values: any[];
    setValues(value: any[]): boolean;
    isArgTypesEqual(argTypes: Types.Type[]): boolean;
    toJson(): MessageJson;
    toString(): string;
}
