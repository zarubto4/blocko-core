import { Types, Events } from 'common-lib';
import { DataChangedEvent } from './Events';

export class ConfigProperty extends Events.Emitter<DataChangedEvent> {

    private _name: string;
    private _displayName: string;
    private _config: any;
    private _type: Types.ConfigPropertyType;

    private _value: any;

    public constructor(type: Types.ConfigPropertyType, name: string, displayName: string, defaultValue: any, config?: any) {
        super();
        this._type = type;
        this._name = name;
        this._displayName = displayName;
        this._config = config || {};
        this._value = defaultValue;

        this.validateOptions();
    }

    protected validateOptions(): boolean {
        if (this.config && this.config.options && Array.isArray(this.config.options)) {
            if (this._type === Types.ConfigPropertyType.Boolean) {
                throw new Error('Boolean type can not have specified any options');
            }

            const options: any[] = this.config.options;

            let baseType = null;
            if (this._type === Types.ConfigPropertyType.Integer || this._type === Types.ConfigPropertyType.Float) {
                baseType = 'number'
            } else if (this._type === Types.ConfigPropertyType.String || this._type === Types.ConfigPropertyType.Color || this._type === Types.ConfigPropertyType.FAIcon) {
                baseType = 'string'
            }

            let valid = true;
            for (let i = 0; i < options.length; i++) {
                if (typeof options[i] !== baseType) {
                    valid = false;
                }
            }

            if (!valid) {
                throw new Error('Options data type must be same, as type of property');
            }

            return true;
        }

        return false;
    }

    // Getters
    get name(): string {
        return this._name;
    }

    get displayName(): string {
        return this._displayName;
    }

    get config(): any {
        if (!this._config) {
            return {};
        }
        return this._config;
    }

    get value(): any {
        return this._value;
    }

    get type(): Types.ConfigPropertyType {
        return this._type;
    }

// Setters

    set displayName(value: string) {
        this._displayName = value;
    }

    set config(value: any) {
        this._config = value;
    }

    set value(value: any) {
        this._value = value;
        this.emit(this, new DataChangedEvent());
    }
}
