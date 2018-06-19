"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_lib_1 = require("common-lib");
const Events_1 = require("./Events");
class ConfigProperty extends common_lib_1.Events.Emitter {
    constructor(type, name, displayName, defaultValue, config) {
        super();
        this._type = type;
        this._name = name;
        this._displayName = displayName;
        this._config = config || {};
        this._value = defaultValue;
        this.validateOptions();
    }
    validateOptions() {
        if (this.config && this.config.options && Array.isArray(this.config.options)) {
            if (this._type === common_lib_1.Types.ConfigPropertyType.Boolean) {
                throw new Error('Boolean type can not have specified any options');
            }
            const options = this.config.options;
            let baseType = null;
            if (this._type === common_lib_1.Types.ConfigPropertyType.Integer || this._type === common_lib_1.Types.ConfigPropertyType.Float) {
                baseType = 'number';
            }
            else if (this._type === common_lib_1.Types.ConfigPropertyType.String || this._type === common_lib_1.Types.ConfigPropertyType.Color || this._type === common_lib_1.Types.ConfigPropertyType.FAIcon) {
                baseType = 'string';
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
    get name() {
        return this._name;
    }
    get displayName() {
        return this._displayName;
    }
    get config() {
        if (!this._config) {
            return {};
        }
        return this._config;
    }
    get value() {
        return this._value;
    }
    get type() {
        return this._type;
    }
    set displayName(value) {
        this._displayName = value;
    }
    set config(value) {
        this._config = value;
    }
    set value(value) {
        this._value = value;
        this.emit(this, new Events_1.DataChangedEvent());
    }
}
exports.ConfigProperty = ConfigProperty;
