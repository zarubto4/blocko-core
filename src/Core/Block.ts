/**
 * Created by davidhradek on 12.04.16.
 */

import {Connector, ConnectorEventType} from "./Connector";
import {
    ExternalConnector, ExternalAnalogConnector, ExternalDigitalConnector, ExternalConnectorType,
    ExternalMessageConnector
} from "./ExternalConnector";
import {ConfigProperty} from "./ConfigProperty";
import {Controller} from "./Controller";
import {Connection} from "./Connection";
import {Size} from "./Size";
import {Message} from "./Message";
import {Types} from "common-lib";

// Interface for block renderer
export interface IBlockRenderer {
    refresh():void;
    destroy():void;
    getConnectorPosition(name:string):{x:number, y:number};
    getPosition():{x:number, y:number};
    refreshDisplayName();
}

export class Block {

    protected inputConnectors:Array<Connector>;
    protected outputConnectors:Array<Connector>;
    protected externalInputConnectors:Array<ExternalConnector<any>>;
    protected externalOutputsConnectors:Array<ExternalConnector<any>>;
    protected configProperties:Array<ConfigProperty>;

    protected _typeOfBlock: string = null;
    protected _blockVersion: string = null;

    public id:string;

    public type:string;
    public visualType:string;

    public configPropertiesDescription: string = null;

    public renderer:IBlockRenderer;

    protected _controller:Controller = null;

    // positions
    private _x:number = 0;
    private _y:number = 0;

    protected _codeBlock:boolean = false;

    public constructor(id:string, type:string, visualType:string) {
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

    get codeBlock():boolean {
        return this._codeBlock;
    }

    get x():number {
        return this._x;
    }

    set x(value:number) {
        if (value == this._x) return;
        this._x = value;
        //if (this.controller) this.controller._emitDataChanged();
    }

    get y():number {
        return this._y;
    }

    set y(value:number) {
        if (value == this._y) return;
        this._y = value;
        //if (this.controller) this.controller._emitDataChanged();
    }

    public sendValueToOutputConnector(connector:Connector, value:boolean|number|Message|any[]) {
        if (!this.controller || (this.controller && !this.controller.configuration.outputEnabled)) return;

        if (this.outputConnectors.indexOf(connector) != -1) {
            connector._outputSetValue(value);
        } else {
            console.log("Connector named " + connector.name + " is not output connector on block " + this.id);
        }
    }

    public addOutputConnector(name:string, type:Types.ConnectorType, displayName:string = null, argTypes:Types.Type[] = null):Connector {
        if (type == Types.ConnectorType.DigitalOutput || type == Types.ConnectorType.AnalogOutput || type == Types.ConnectorType.MessageOutput) {
            var connector:Connector = new Connector(this, name, displayName, type, argTypes);
            this.outputConnectors.push(connector);
            return connector;
        }
        console.log("Cannot add connector with type " + type + " as output connector.");
        return null;
    }

    public addInputConnector(name:string, type:Types.ConnectorType, displayName:string = null, argTypes:Types.Type[] = null):Connector {
        if (type == Types.ConnectorType.DigitalInput || type == Types.ConnectorType.AnalogInput || type == Types.ConnectorType.MessageInput) {
            var connector:Connector = new Connector(this, name, displayName, type, argTypes);
            this.inputConnectors.push(connector);
            return connector;
        }
        console.log("Cannot add connector with type " + type + " as input connector.");
        return null;
    }

    public removeOutputConnector(connector:Connector):void {
        if (!connector) return;
        this.disconnectConnectionFromConnector(connector);
        var index = this.outputConnectors.indexOf(connector);
        if (index > -1) {
            this.outputConnectors.splice(index, 1);
        }
    }

    public removeInputConnector(connector:Connector):void {
        if (!connector) return;
        this.disconnectConnectionFromConnector(connector);
        var index = this.inputConnectors.indexOf(connector);
        if (index > -1) {
            this.inputConnectors.splice(index, 1);
        }
    }

    protected addExternalInputConnector(targetId:string, name:string, type:Types.ConnectorType, argTypes:Types.Type[] = null):ExternalConnector<any> {
        if (type == Types.ConnectorType.DigitalInput) {
            var connector:ExternalConnector<any> = new ExternalDigitalConnector(this, targetId, name, ExternalConnectorType.Input);
            this.externalInputConnectors.push(connector);
            return connector;
        }
        if (type == Types.ConnectorType.AnalogInput) {
            var connector:ExternalConnector<any> = new ExternalAnalogConnector(this, targetId, name, ExternalConnectorType.Input);
            this.externalInputConnectors.push(connector);
            return connector;
        }
        if (type == Types.ConnectorType.MessageInput) {
            var connector:ExternalConnector<any> = new ExternalMessageConnector(this, targetId, name, ExternalConnectorType.Input, argTypes);
            this.externalInputConnectors.push(connector);
            return connector;
        }
        console.log("Cannot add connector with type " + type + " as external input connector.");
        return null;
    }

    protected addExternalOutputConnector(targetId:string, name:string,  type:Types.ConnectorType, argTypes:Types.Type[] = null):ExternalConnector<any> {
        if (type == Types.ConnectorType.DigitalOutput) {
            var connector:ExternalConnector<any> = new ExternalDigitalConnector(this, targetId, name, ExternalConnectorType.Output);
            this.externalOutputsConnectors.push(connector);
            return connector;
        }
        if (type == Types.ConnectorType.AnalogOutput) {
            var connector:ExternalConnector<any> = new ExternalAnalogConnector(this, targetId, name, ExternalConnectorType.Output);
            this.externalOutputsConnectors.push(connector);
            return connector;
        }
        if (type == Types.ConnectorType.MessageOutput) {
            var connector:ExternalConnector<any> = new ExternalMessageConnector(this, targetId, name, ExternalConnectorType.Output, argTypes);
            this.externalOutputsConnectors.push(connector);
            return connector;
        }
        console.log("Cannot add connector with type " + type + " as external output connector.");
        return null;
    }

    protected removeExternalInputConnector(connector:ExternalConnector<any>):void {
        if (!connector) return;
        var index = this.externalInputConnectors.indexOf(connector);
        if (index > -1) {
            this.externalInputConnectors.splice(index, 1);
        }
    }

    protected removeExternalOutputConnector(connector:ExternalConnector<any>):void {
        if (!connector) return;
        var index = this.externalOutputsConnectors.indexOf(connector);
        if (index > -1) {
            this.externalOutputsConnectors.splice(index, 1);
        }
    }

    // config properties

    public addConfigProperty(type:Types.ConfigPropertyType, id:string, displayName:string, defaultValue:any, config?:any) {
        var configProperty:ConfigProperty = new ConfigProperty(type, id, displayName, defaultValue, config);
        this.configProperties.push(configProperty);
        return configProperty;
    }

    public getConfigProperties():Array<ConfigProperty> {
        return this.configProperties;
    }

    public removeConfigProperty(configProperty:ConfigProperty):void {
        if (!configProperty) return;
        var index = this.configProperties.indexOf(configProperty);
        if (index > -1) {
            this.configProperties.splice(index, 1);
        }
    }

    // getters for connectors

    public getInputConnectors():Array<Connector> {
        return this.inputConnectors;
    }

    public getOutputConnectors():Array<Connector> {
        return this.outputConnectors;
    }

    public getExternalInputConnectors():Array<ExternalConnector<any>> {
        return this.externalInputConnectors;
    }

    public getExternalOutputConnectors():Array<ExternalConnector<any>> {
        return this.externalOutputsConnectors;
    }


    private initializationCallbacks:Array<() => void> = [];

    public registerInitializationCallback(callback:() => void):void {
        this.initializationCallbacks.push(callback);
    }

    public initialize():void {
        this.initializationCallbacks.forEach(callback => callback());
        if (this.renderer) this.renderer.refresh();
    }

    // inputs/outputs

    private outputEventCallbacks:Array<(connector:Connector, eventType:ConnectorEventType, value:boolean|number|Message) => void> = [];
    public registerOutputEventCallback(callback:(connector:Connector, eventType:ConnectorEventType, value:boolean|number|Message) => void):void {
        this.outputEventCallbacks.push(callback);
    }

    public _outputEvent(connector:Connector, eventType:ConnectorEventType, value:boolean|number|Message) {
        this.outputEventCallbacks.forEach(callback => callback(connector, eventType, value));

        if (this.controller.configuration.outputEnabled) {
            this.outputChanged(connector, eventType, value);
        }

        if (this.renderer) this.renderer.refresh();
    }

    protected outputChanged(connector:Connector, eventType:ConnectorEventType, value:boolean|number|Message):void {
        connector.connections.forEach(connection => {
            var cOther:Connector = connection.getOtherConnector(connector);
            cOther._inputSetValue(value);
        });
    }

    private inputEventCallbacks:Array<(connector:Connector, eventType:ConnectorEventType, value:boolean|number|Message) => void> = [];
    public registerInputEventCallback(callback:(connector:Connector, eventType:ConnectorEventType, value:boolean|number|Message) => void):void {
        this.inputEventCallbacks.push(callback);
    }

    public _inputEvent(connector:Connector, eventType:ConnectorEventType, value:boolean|number|Message) {
        this.inputEventCallbacks.forEach(callback => callback(connector, eventType, value));

        if (this.controller.configuration.inputEnabled) {
            this.inputChanged(connector, eventType, value);
        }

        if (this.renderer) this.renderer.refresh();
    }

    protected inputChanged(connector:Connector, eventType:ConnectorEventType, value:boolean|number|Message):void {
    }

    // external inputs/outputs
    private externalOutputEventCallbacks:Array<(connector:ExternalConnector<any>, eventType:ConnectorEventType, value:boolean|number|Message)=>void> = [];
    public registerExternalOutputEventCallback(callback:(connector:ExternalConnector<any>, eventType:ConnectorEventType, value:boolean|number|Message) => void):void {
        this.externalOutputEventCallbacks.push(callback);
    }

    public _externalOutputEvent(connector:ExternalConnector<any>, eventType:ConnectorEventType, value:boolean|number|Message) {
        this.externalOutputEventCallbacks.forEach(callback => callback(connector, eventType, value));
        this.externalOutputEvent(connector, eventType, value);
        if (this.renderer) this.renderer.refresh();
    }

    public externalOutputEvent(connector:ExternalConnector<any>, eventType:ConnectorEventType, value:boolean|number|Message):void {
    }


    private externalInputEventCallbacks:Array<(connector:ExternalConnector<any>, eventType:ConnectorEventType, value:boolean|number|Message)=>void> = [];
    public registerExternalInputEventCallback(callback:(connector:ExternalConnector<any>, eventType:ConnectorEventType, value:boolean|number|Message) => void):void {
        this.externalInputEventCallbacks.push(callback);
    }

    public _externalInputEvent(connector:ExternalConnector<any>, eventType:ConnectorEventType, value:boolean|number|Message) {
        this.externalInputEventCallbacks.forEach(callback => callback(connector, eventType, value));
        this.externalInputEvent(connector, eventType, value);
        if (this.renderer) this.renderer.refresh();
    }

    public externalInputEvent(connector:ExternalConnector<any>, eventType:ConnectorEventType, value:boolean|number|Message):void {
    }

    // configs

    private configChangedCallbacks:Array<() => void> = [];

    public registerConfigChangedCallback(callback:() => void):void {
        this.configChangedCallbacks.push(callback);
    }

    public emitConfigChanged() {
        this.configChanged();
        this.configChangedCallbacks.forEach(callback => callback());
        //if (this.controller) this.controller._emitDataChanged();
    }

    public getConfigData():any {
        var config = {};
        this.configProperties.forEach((configProperty:ConfigProperty) => {
            config[configProperty.name] = configProperty.value;
        });
        return config;
    }

    public getConfigPropertyByName(name:string):ConfigProperty {
        var cp:ConfigProperty = null;
        this.configProperties.forEach((configProperty:ConfigProperty) => {
            if (configProperty.name == name) {
                cp = configProperty;
            }
        });
        return cp;
    }

    public setConfigData(json:any):void {

        for (var key in json) {
            if (json.hasOwnProperty(key)) {
                var cp:ConfigProperty = this.getConfigPropertyByName(key);
                if (cp) {
                    cp.value = json[key];
                }
            }
        }

        this.emitConfigChanged();

    }

    private disconnectConnectionFromConnector(connector:Connector):void {
        var toDisconnect:Array<Connection> = connector.connections.splice(0);
        toDisconnect.forEach((connection:Connection) => {
            connection.disconnect();
        });
    }

    public remove():void {

        this.inputConnectors.forEach((connector:Connector) => {
            this.disconnectConnectionFromConnector(connector);
        });
        this.outputConnectors.forEach((connector:Connector) => {
            this.disconnectConnectionFromConnector(connector);
        });

        if (this.renderer) this.renderer.destroy();

        if (this.controller) {
            this.controller._removeBlock(this);
        }
    }

    public getOutputConnectorByName(name:string):Connector {
        var connector:Connector = null;
        this.outputConnectors.forEach((c:Connector) => {
            if (c.name == name) {
                connector = c;
            }
        });
        return connector;
    }

    public getInputConnectorByName(name:string):Connector {
        var connector:Connector = null;
        this.inputConnectors.forEach((c:Connector) => {
            if (c.name == name) {
                connector = c;
            }
        });
        return connector;
    }

    // ---- TO OVERRIDE ----

    public configChanged():void {
    }

    public onMouseDrag(event: {dx: number, dy: number}): boolean {return false;}
    public onMouseClick(): void {}
    public onMouseDown(): void {}
    public onMouseUp(): void {}

    // renderer methods

    public rendererGetBlockBackgroundColor():string {
        // OVERRIDE ME!!!
        return "#ccc"; // default
    }

    public rendererGetDisplayName():string {
        return this.visualType;
    }

    public rendererGetBlockName():string {
        return this.id;
    }

    public rendererGetDisplayNameCursor():string {
        return "move";
    }

    public rendererGetBlockSize():Size {
        var maxCon = Math.max(this.inputConnectors.length, this.outputConnectors.length);
        var height = Math.max(69, 69 + ((maxCon-2) * 20));
        return new Size(59, height);
    }

    public rendererCanDelete():boolean {
        return true;
    }

    public rendererShowBlockName():boolean {
        return true;
    }

    public rendererRotateDisplayName():number {
        return 0;
    }

    public rendererCustomSvgPath(size:Size):string {
        return null;
    }

    public rendererGetBlockDescription():string {
        return null;
    }

    public rendererGetCodeName():string {
        return "";
    }

    public get typeOfBlock(): string {
        return this._typeOfBlock;
    }

    public get blockVersion(): string {
        return this._blockVersion;
    }

    public set blockVersion(version: string) {
        this._blockVersion = version;
    }

}