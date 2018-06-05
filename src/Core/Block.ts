
import {
    ConnectorEvent, Connector, ConnectorEventType, DigitalConnector, AnalogConnector,
    MessageConnector, JsonConnector
} from './Connector';
import {
    ExternalConnector, ExternalAnalogConnector, ExternalDigitalConnector, ExternalConnectorType,
    ExternalMessageConnector, ExternalConnectorEvent
} from './ExternalConnector';
import { ConfigProperty } from './ConfigProperty';
import { Controller } from './Controller';
import { Connection } from './Connection';
import { Message, MessageJson } from './Message';
import { Types } from 'common-lib';
import { IRenderer } from './Renderer';

// Interface for block renderer
export interface IBlockRenderer extends IRenderer {
    isHovered(): boolean;
}

export class Block {

    protected inputConnectors: Array<Connector<boolean|number|object|Message>>;
    protected outputConnectors: Array<Connector<boolean|number|object|Message>>;
    protected externalInputConnectors: Array<ExternalConnector<any>>;
    protected externalOutputsConnectors: Array<ExternalConnector<any>>;
    protected configProperties: Array<ConfigProperty>;

    protected _blockId: string = null; // Id assigned from tyrion
    protected _versionId: string = null; // Id assigned from tyrion
    protected _color: string = null;

    public id: string; // Id in blocko program (assigned from blocko)

    public type: string;
    public visualType: string;

    public configPropertiesDescription: string = null;

    public renderer: IBlockRenderer;

    protected _controller: Controller = null;

    // positions
    private _x: number = 0;
    private _y: number = 0;

    protected _codeBlock: boolean = false;

    public constructor(id: string, type: string, visualType: string) {
        this.id = id;
        this.type = type;
        this.visualType = visualType;

        this.inputConnectors = [];
        this.outputConnectors = [];

        this.externalInputConnectors = [];
        this.externalOutputsConnectors = [];

        this.configProperties = [];
    }

    public get controller(): Controller {
        return this._controller;
    }

    public set controller(controller: Controller) {
        if (!this._controller) {
            this._controller = controller;
            this.afterControllerSet();
        }
    }

    protected afterControllerSet() {}

    get codeBlock(): boolean {
        return this._codeBlock;
    }

    get x(): number {
        return this._x;
    }

    set x(value: number) {
        if (value !== this._x) {
            this._x = value;
        }
        // if (this.controller) this.controller._emitDataChanged();
    }

    get y(): number {
        return this._y;
    }

    set y(value: number) {
        if (value !== this._y) {
            this._y = value;
        }
        // if (this.controller) this.controller._emitDataChanged();
    }

    public sendValueToOutputConnector(event: ConnectorEvent) {
        if (!this.controller || (this.controller && !this.controller.configuration.outputEnabled)) {
            return;
        }

        if (this.outputConnectors.indexOf(event.connector) !== -1) {
            event.connector._outputSetValue(event.value, event.interfaceId);
        } else {
            console.warn('Connector named ' + event.connector.id + ' is not output connector on block ' + this.id);
        }
    }

    public addOutputConnector(id: string, type: Types.ConnectorType, name: string = null, argTypes: Types.Type[] = null): Connector<boolean|number|object|Message> {
        let connector: Connector<boolean|number|object|Message>;

        switch (type) {
            case Types.ConnectorType.DigitalOutput: {
                connector = new DigitalConnector(this, id, name, type);
                break;
            }
            case Types.ConnectorType.AnalogOutput: {
                connector = new AnalogConnector(this, id, name, type);
                break;
            }
            case Types.ConnectorType.MessageOutput: {
                connector = new MessageConnector(this, id, name, type, argTypes);
                break;
            }
            case Types.ConnectorType.JsonOutput: {
                connector = new JsonConnector(this, id, name, type);
                break;
            }
            default: {
                console.error('Block::addOutputConnector - cannot add connector with type ' + type + ' as output connector.');
                return null;
            }
        }

        this.outputConnectors.push(connector);

        return connector;
    }

    public addInputConnector(id: string, type: Types.ConnectorType, name: string = null, argTypes: Types.Type[] = null): Connector<boolean|number|object|Message> {
        let connector: Connector<boolean|number|object|Message>;

        switch (type) {
            case Types.ConnectorType.DigitalInput: {
                connector = new DigitalConnector(this, id, name, type);
                break;
            }
            case Types.ConnectorType.AnalogInput: {
                connector = new AnalogConnector(this, id, name, type);
                break;
            }
            case Types.ConnectorType.MessageInput: {
                connector = new MessageConnector(this, id, name, type, argTypes);
                break;
            }
            case Types.ConnectorType.JsonInput: {
                connector = new JsonConnector(this, id, name, type);
                break;
            }
            default: {
                console.error('Block::addInputConnector - cannot add connector with type ' + type + ' as input connector.');
                return null;
            }
        }

        this.inputConnectors.push(connector);
        return connector;
    }

    public removeOutputConnector(connector: Connector<boolean|number|object|Message>): void {
        if (connector) {
            this.disconnectConnectionFromConnector(connector);
            let index = this.outputConnectors.indexOf(connector);
            if (index > -1) {
                this.outputConnectors.splice(index, 1);
            }
        }
    }

    public removeInputConnector(connector: Connector<boolean|number|object|Message>): void {
        if (connector) {
            this.disconnectConnectionFromConnector(connector);
            let index = this.inputConnectors.indexOf(connector);
            if (index > -1) {
                this.inputConnectors.splice(index, 1);
            }
        }
    }

    protected addExternalInputConnector(targetId: string, name: string, type: Types.ConnectorType, argTypes: Types.Type[] = null): ExternalConnector<any> {
        if (type === Types.ConnectorType.DigitalInput) {
            let connector: ExternalConnector<any> = new ExternalDigitalConnector(this, targetId, name, ExternalConnectorType.Input);
            this.externalInputConnectors.push(connector);
            return connector;
        }
        if (type === Types.ConnectorType.AnalogInput) {
            let connector: ExternalConnector<any> = new ExternalAnalogConnector(this, targetId, name, ExternalConnectorType.Input);
            this.externalInputConnectors.push(connector);
            return connector;
        }
        if (type === Types.ConnectorType.MessageInput) {
            let connector: ExternalConnector<any> = new ExternalMessageConnector(this, targetId, name, ExternalConnectorType.Input, argTypes);
            this.externalInputConnectors.push(connector);
            return connector;
        }
        console.warn('Cannot add connector with type ' + type + ' as external input connector.');
        return null;
    }

    protected addExternalOutputConnector(targetId: string, name: string, type: Types.ConnectorType, argTypes: Types.Type[] = null): ExternalConnector<any> {
        if (type === Types.ConnectorType.DigitalOutput) {
            let connector: ExternalConnector<any> = new ExternalDigitalConnector(this, targetId, name, ExternalConnectorType.Output);
            this.externalOutputsConnectors.push(connector);
            return connector;
        }
        if (type === Types.ConnectorType.AnalogOutput) {
            let connector: ExternalConnector<any> = new ExternalAnalogConnector(this, targetId, name, ExternalConnectorType.Output);
            this.externalOutputsConnectors.push(connector);
            return connector;
        }
        if (type === Types.ConnectorType.MessageOutput) {
            let connector: ExternalConnector<any> = new ExternalMessageConnector(this, targetId, name, ExternalConnectorType.Output, argTypes);
            this.externalOutputsConnectors.push(connector);
            return connector;
        }
        console.warn('Cannot add connector with type ' + type + ' as external output connector.');
        return null;
    }

    protected removeExternalInputConnector(connector: ExternalConnector<any>): void {
        if (connector) {
            let index = this.externalInputConnectors.indexOf(connector);
            if (index > -1) {
                this.externalInputConnectors.splice(index, 1);
            }
        }
    }

    protected removeExternalOutputConnector(connector: ExternalConnector<any>): void {
        if (connector) {
            let index = this.externalOutputsConnectors.indexOf(connector);
            if (index > -1) {
                this.externalOutputsConnectors.splice(index, 1);
            }
        }
    }

    // config properties

    public addConfigProperty(type: Types.ConfigPropertyType, id: string, displayName: string, defaultValue: any, config?: any) {
        let configProperty: ConfigProperty = new ConfigProperty(type, id, displayName, defaultValue, this.emitConfigChanged.bind(this), config);
        this.configProperties.push(configProperty);
        return configProperty;
    }

    public getConfigProperties(): Array<ConfigProperty> {
        return this.configProperties;
    }

    public removeConfigProperty(configProperty: ConfigProperty): void {
        if (configProperty) {
            let index = this.configProperties.indexOf(configProperty);
            if (index > -1) {
                this.configProperties.splice(index, 1);
            }
        }
    }

    // getters for connectors

    public getInputConnectors(): Array<Connector<boolean|number|object|Message>> {
        return this.inputConnectors;
    }

    public getOutputConnectors(): Array<Connector<boolean|number|object|Message>> {
        return this.outputConnectors;
    }

    public getExternalInputConnectors(): Array<ExternalConnector<any>> {
        return this.externalInputConnectors;
    }

    public getExternalOutputConnectors(): Array<ExternalConnector<any>> {
        return this.externalOutputsConnectors;
    }


    private initializationCallbacks: Array<() => void> = [];

    public registerInitializationCallback(callback: () => void): void {
        this.initializationCallbacks.push(callback);
    }

    public initialize(): void {
        this.initializationCallbacks.forEach(callback => callback());
        if (this.renderer) {
            this.renderer.refresh();
        }
    }

    // inputs/outputs

    private outputEventCallbacks: Array<(connector: Connector<boolean|number|object|Message>, eventType: ConnectorEventType, value: boolean|number|MessageJson|Object) => void> = [];
    public registerOutputEventCallback(callback: (connector: Connector<boolean|number|object|Message>, eventType: ConnectorEventType, value: boolean|number|MessageJson|Object) => void): void {
        this.outputEventCallbacks.push(callback);
    }

    public _outputEvent(event: ConnectorEvent) {
        this.outputEventCallbacks.forEach(callback => callback(event.connector, event.eventType, event.value instanceof Message ? event.value.toJson() : event.value));

        if (this.controller.configuration.outputEnabled) {
            this.outputChanged(event);
        }

        if (this.renderer) {
            this.renderer.refresh();
        }
    }

    protected outputChanged(event: ConnectorEvent): void {
        event.connector.connections.forEach(connection => {
            let cOther: Connector<boolean|number|object|Message> = connection.getOtherConnector(event.connector);
            cOther._inputSetValue(event.value, event.interfaceId);
        });
    }

    private inputEventCallbacks: Array<(connector: Connector<boolean|number|object|Message>, eventType: ConnectorEventType, value: boolean|number|MessageJson|Object) => void> = [];
    public registerInputEventCallback(callback: (connector: Connector<boolean|number|object|Message>, eventType: ConnectorEventType, value: boolean|number|MessageJson|Object) => void): void {
        this.inputEventCallbacks.push(callback);
    }

    public _inputEvent(event: ConnectorEvent) {
        this.inputEventCallbacks.forEach(callback => callback(event.connector, event.eventType, event.value instanceof Message ? event.value.toJson() : event.value));

        if (this.controller.configuration.inputEnabled) {
            this.inputChanged(event);
        }

        if (this.renderer) {
            this.renderer.refresh();
        }
    }

    protected inputChanged(event: ConnectorEvent): void {
    }

    // external inputs/outputs
    private externalOutputEventCallbacks: Array<(connector: ExternalConnector<any>, eventType: ConnectorEventType, value: boolean|number|Message) => void> = [];
    public registerExternalOutputEventCallback(callback: (connector: ExternalConnector<any>, eventType: ConnectorEventType, value: boolean|number|Message) => void): void {
        this.externalOutputEventCallbacks.push(callback);
    }

    public _externalOutputEvent(event: ExternalConnectorEvent) {
        this.externalOutputEventCallbacks.forEach(callback => callback(event.connector, event.eventType, event.value));
        this.externalOutputEvent(event);
        if (this.renderer) {
            this.renderer.refresh();
        }
    }

    public externalOutputEvent(event: ExternalConnectorEvent): void {
    }


    private externalInputEventCallbacks: Array<(connector: ExternalConnector<any>, eventType: ConnectorEventType, value: boolean|number|Message) => void> = [];
    public registerExternalInputEventCallback(callback: (connector: ExternalConnector<any>, eventType: ConnectorEventType, value: boolean|number|Message) => void): void {
        this.externalInputEventCallbacks.push(callback);
    }

    public _externalInputEvent(event: ExternalConnectorEvent) {
        this.externalInputEventCallbacks.forEach(callback => callback(event.connector, event.eventType, event.value));
        this.externalInputEvent(event);
        if (this.renderer) {
            this.renderer.refresh();
        }
    }

    public externalInputEvent(event: ExternalConnectorEvent): void {
    }

    // configs

    private configChangedCallbacks: Array<() => void> = [];

    public registerConfigChangedCallback(callback: () => void): void {
        this.configChangedCallbacks.push(callback);
    }

    public emitConfigChanged() {
        this.configChanged();
        this.configChangedCallbacks.forEach(callback => callback());
        // if (this.controller) this.controller._emitDataChanged();
    }

    public getConfigData(): any {
        let config = {};
        this.configProperties.forEach((configProperty: ConfigProperty) => {
            config[configProperty.name] = configProperty.value;
        });
        return config;
    }

    public getConfigPropertyByName(name: string): ConfigProperty {
        let cp: ConfigProperty = null;
        this.configProperties.forEach((configProperty: ConfigProperty) => {
            if (configProperty.name === name) {
                cp = configProperty;
            }
        });
        return cp;
    }

    public setConfigData(json: any): void {

        for (let key in json) {
            if (json.hasOwnProperty(key)) {
                let cp: ConfigProperty = this.getConfigPropertyByName(key);
                if (cp) {
                    cp.value = json[key];
                }
            }
        }

        this.emitConfigChanged();

    }

    private disconnectConnectionFromConnector(connector: Connector<boolean|number|object|Message>): void {
        let toDisconnect: Array<Connection> = connector.connections.splice(0);
        toDisconnect.forEach((connection: Connection) => {
            connection.disconnect();
        });
    }

    public remove(): void {

        this.inputConnectors.forEach((connector: Connector<boolean|number|object|Message>) => {
            this.disconnectConnectionFromConnector(connector);
        });
        this.outputConnectors.forEach((connector: Connector<boolean|number|object|Message>) => {
            this.disconnectConnectionFromConnector(connector);
        });

        if (this.renderer) {
            this.renderer.destroy();
        }

        if (this.controller) {
            this.controller._removeBlock(this);
        }
    }

    public getOutputConnectorById(id: string): Connector<boolean|number|object|Message> {
        let connector: Connector<boolean|number|object|Message> = null;
        this.outputConnectors.forEach((c: Connector<boolean|number|object|Message>) => {
            if (c.id === id) {
                connector = c;
            }
        });
        return connector;
    }

    public getInputConnectorById(id: string): Connector<boolean|number|object|Message> {
        let connector: Connector<boolean|number|object|Message> = null;
        this.inputConnectors.forEach((c: Connector<boolean|number|object|Message>) => {
            if (c.id === id) {
                connector = c;
            }
        });
        return connector;
    }

    // ---- TO OVERRIDE ----

    public configChanged(): void {
    }

    public onMouseDrag(event: {dx: number, dy: number}): boolean { return false; }
    public onMouseClick(): void {}
    public onMouseDown(): void {}
    public onMouseUp(): void {}

    // renderer methods

    public isInterface(): boolean {
        return false;
    }

    public rendererGetDisplayName(): string {
        return this.visualType;
    }

    public rendererGetBlockName(): string {
        return this.id;
    }

    public rendererGetCodeName(): string {
        return '';
    }

    public rendererIsHwAttached(): boolean {
        return false;
    }

    public get blockId(): string {
        return this._blockId;
    }

    public get versionId(): string {
        return this._versionId;
    }

    public set versionId(version: string) {
        this._versionId = version;
    }
}
