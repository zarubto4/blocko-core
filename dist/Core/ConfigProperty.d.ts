import { Types, Events } from 'common-lib';
import { DataChangedEvent } from './Events';
export declare class ConfigProperty extends Events.Emitter<DataChangedEvent> {
    private _name;
    private _displayName;
    private _config;
    private _type;
    private _value;
    constructor(type: Types.ConfigPropertyType, name: string, displayName: string, defaultValue: any, config?: any);
    protected validateOptions(): boolean;
    readonly name: string;
    displayName: string;
    config: any;
    value: any;
    readonly type: Types.ConfigPropertyType;
}
