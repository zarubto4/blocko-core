
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
import { Types, Events } from 'common-lib';
import {
    BindInterfaceEvent,
    ConfigPropertyAddedEvent, ConfigPropertyRemovedEvent, ConnectorAddedEvent,
    ConnectorRemovedEvent, DataChangedEvent, DestroyEvent, RuntimeErrorEvent
} from './Events';

export abstract class Block extends Events.Emitter<ConnectorAddedEvent|ConnectorRemovedEvent|ConfigPropertyAddedEvent|ConfigPropertyRemovedEvent|DestroyEvent|RuntimeErrorEvent|BindInterfaceEvent|DataChangedEvent> {

    protected _controller: Controller = null;

    protected _data: object; // Object that can contain any additional data

    protected inputConnectors: Array<Connector<boolean|number|object|Message>>;
    protected outputConnectors: Array<Connector<boolean|number|object|Message>>;
    protected externalInputConnectors: Array<ExternalConnector<any>>;
    protected externalOutputsConnectors: Array<ExternalConnector<any>>;
    protected configProperties: Array<ConfigProperty>;

    public id: string; // Id in blocko program (assigned from blocko)
    public name: string;
    public description: string;

    public type: string;
    public visualType: string;

    public configPropertiesDescription: string = null;

    protected _codeBlock: boolean = false;

    public constructor(id: string, type: string) {
        super();
        this.id = id;
        this.type = type;

        this._data = {};

        this.inputConnectors = [];
        this.outputConnectors = [];

        this.externalInputConnectors = [];
        this.externalOutputsConnectors = [];

        this.configProperties = [];
    }

    /**
     * The setup of the block (e.g. adding IO or configProperties) should happen in this method
     */
    public abstract initialize(): void;

    public get controller(): Controller {
        return this._controller;
    }

    public set controller(controller: Controller) {
        if (!this._controller) {
            this._controller = controller;
            this.afterControllerSet();
        }
    }

    public get data(): object {
        return this._data;
    }

    protected afterControllerSet() {}

    public getDataJson(): object {
        let data = {
            id: this.id,
            type: this.type,
            name: this.name,
            description: this.description,
            config: this.getConfigData(),
            data: this._data,
            outputs: {}
        };

        this.outputConnectors.forEach((connector: Connector<boolean|number|object|Message>) => {
            let connectionsJson: Array<any> = [];

            connector.connections.forEach((connection: Connection) => {
                let otherConnector: Connector<boolean|number|object|Message> = connection.getOtherConnector(connector);
                connectionsJson.push({
                    'block': otherConnector.block.id,
                    'connector': otherConnector.id
                })
            });

            data['outputs'][connector.id] = connectionsJson;
        });

        return data;
    }

    public setDataJson(data: object): void {

        if (data['id']) {
            this.id = data['id'];
        }

        if (data['name']) {
            this.name = data['name'];
        }

        if (data['description']) {
            this.description = data['description'];
        }

        if (data['data']) {
            this._data = data['data'];
        }
    }

    get codeBlock(): boolean {
        return this._codeBlock;
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

    /*******************************************
     *                                         *
     *    CONNECTOR API                        *
     *                                         *
     *******************************************/

    // INPUT

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
        this.emit(this, new ConnectorAddedEvent(connector));

        return connector;
    }

    public getInputConnectors(): Array<Connector<boolean|number|object|Message>> {
        return this.inputConnectors;
    }

    public removeInputConnector(connector: Connector<boolean|number|object|Message>): void {
        if (connector) {
            this.disconnectConnectionFromConnector(connector);
            let index = this.inputConnectors.indexOf(connector);
            if (index > -1) {
                this.inputConnectors.splice(index, 1);
                this.emit(this, new ConnectorRemovedEvent(connector));
            }
        }
    }

    // OUTPUT

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
        this.emit(this, new ConnectorAddedEvent(connector));

        return connector;
    }

    public getOutputConnectors(): Array<Connector<boolean|number|object|Message>> {
        return this.outputConnectors;
    }

    public removeOutputConnector(connector: Connector<boolean|number|object|Message>): void {
        if (connector) {
            this.disconnectConnectionFromConnector(connector);
            let index = this.outputConnectors.indexOf(connector);
            if (index > -1) {
                this.outputConnectors.splice(index, 1);
                this.emit(this, new ConnectorRemovedEvent(connector));
            }
        }
    }

    // EXTERNAL INPUT

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

    public getExternalInputConnectors(): Array<ExternalConnector<any>> {
        return this.externalInputConnectors;
    }

    protected removeExternalInputConnector(connector: ExternalConnector<any>): void {
        if (connector) {
            let index = this.externalInputConnectors.indexOf(connector);
            if (index > -1) {
                this.externalInputConnectors.splice(index, 1);
            }
        }
    }

    // EXTERNAL OUTPUT

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

    public getExternalOutputConnectors(): Array<ExternalConnector<any>> {
        return this.externalOutputsConnectors;
    }

    protected removeExternalOutputConnector(connector: ExternalConnector<any>): void {
        if (connector) {
            let index = this.externalOutputsConnectors.indexOf(connector);
            if (index > -1) {
                this.externalOutputsConnectors.splice(index, 1);
            }
        }
    }

    /*******************************************
     *                                         *
     *    CONFIG PROPERTY API                  *
     *                                         *
     *******************************************/

    public addConfigProperty(type: Types.ConfigPropertyType, id: string, displayName: string, defaultValue: any, config?: any) {
        let configProperty: ConfigProperty = new ConfigProperty(type, id, displayName, defaultValue, config);
        this.configProperties.push(configProperty);
        configProperty.listenEvent('dataChanged', (e) => {
            this.emitConfigChanged();
        });
        this.emit(this, new ConfigPropertyAddedEvent(configProperty));
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
                this.emit(this, new ConfigPropertyRemovedEvent(configProperty));
            }
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

        // TODO render refresh?
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

        // TODO render refresh?
    }

    protected inputChanged(event: ConnectorEvent): void {
    }

    // external inputs/outputs
    private externalOutputEventCallbacks: Array<(block: Block, event: ExternalConnectorEvent) => void> = [];
    public registerExternalOutputEventCallback(callback: (block: Block, event: ExternalConnectorEvent) => void): void {
        this.externalOutputEventCallbacks.push(callback);
    }

    public _externalOutputEvent(event: ExternalConnectorEvent) {
        this.externalOutputEventCallbacks.forEach(callback => callback(this, event));
        this.externalOutputEvent(event);
        // TODO render refresh?
    }

    public externalOutputEvent(event: ExternalConnectorEvent): void {
    }


    private externalInputEventCallbacks: Array<(block: Block, event: ExternalConnectorEvent) => void> = [];
    public registerExternalInputEventCallback(callback: (block: Block, event: ExternalConnectorEvent) => void): void {
        this.externalInputEventCallbacks.push(callback);
    }

    public _externalInputEvent(event: ExternalConnectorEvent) {
        this.externalInputEventCallbacks.forEach(callback => callback(this, event));
        this.externalInputEvent(event);
        // TODO render refresh?
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

        this.emit(this, new DestroyEvent());

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

    // renderer methods

    public isInterface(): boolean {
        return false;
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
}
