import { Types } from "common-lib";
export declare class ConfigProperty {
    private _name;
    private _displayName;
    private _config;
    private _type;
    private _value;
    private _changeCallback;
    constructor(type: Types.ConfigPropertyType, name: string, displayName: string, defaultValue: any, changeCallback: () => void, config?: any);
    protected validateOptions(): boolean;
    readonly name: string;
    displayName: string;
    config: any;
    value: any;
    readonly type: Types.ConfigPropertyType;
}
