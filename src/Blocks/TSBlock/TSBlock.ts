

import * as Core from '../../Core/index';
import {Connector, ConnectorEventType} from "../../Core/Connector";
import {Message, MessageHelpers} from "../../Core/Message";
import {Machine, TypeScriptCodeLayer, SafeCodeLayer, TypescriptBuildError} from "script-engine";
import {TSBlockLib} from "../Libraries/TSBlockLib";
import {ServiceLib} from "../Libraries/ServiceLib";
import {FetchLib} from "../Libraries/FetchLib";

import {RestApiService} from "../Services/RestApiService";
import {XmlApiService} from "../Services/XmlApiService";
import {FetchService} from "../Services/FetchService";

import {Libs} from "common-lib";

//import * as src from "typescript";

declare let ts;
declare const require;

export class TSBlock extends Core.Block {

    private _tsCode:string = "";
    private _tsCodeError = false;

    private _machine:Machine = null;
    private _utilsLib:Libs.UtilsLib = null;
    private _tsBlockLib:TSBlockLib = null;
    private _consoleLib:Libs.ConsoleLib = null;
    private _serviceLib:ServiceLib = null;
    private _fetchLib:FetchLib = null;

    protected _displayName:string = "";
    protected _backgroundColor:string = "";
    protected _description:string = null;

    public canAddsIO = false;

    protected _designJson: string;

    public constructor(id:string, tsCode?:string, designJson?:string) {
        super(id, "tsBlock", "tsBlock");
        this._codeBlock = true;

        if (!tsCode) {
            tsCode = "";
            this._tsCodeError = true;
        }
        if (!designJson) {
            designJson = "{}";
        }

        this._tsCode = tsCode;
        this.setDesignJson(designJson);
    }

    protected afterControllerSet() {
        this._machine = new Machine();
        this._tsBlockLib = new TSBlockLib(this);
        this._utilsLib = new Libs.UtilsLib(!this.controller.configuration.asyncEventsEnabled);
        this._consoleLib = new Libs.ConsoleLib();
        this._fetchLib = new FetchLib();
        this._serviceLib = new ServiceLib(this.controller.servicesHandler);

        this._consoleLib.setOnLog(this.onLog);
        this._machine.include(this._utilsLib);
        this._machine.include(this._tsBlockLib);
        this._machine.include(this._consoleLib);
        this._machine.include(this._fetchLib);
        this._machine.include(this._serviceLib);

        if (this._tsCode) {
            this.setCode(this._tsCode); // TODO:
        }
    }

    protected onLog = (type:string, message:string) => {
        if (this.controller) {
            this.controller._emitLog(this, type, message);
        }
    };

    get code():string {
        return this._tsCode;
    }

    get codeError():boolean {
        return this._tsCodeError;
    }

    get designJson():string {
        return JSON.stringify({
            displayName: this._displayName,
            backgroundColor: this._backgroundColor,
            description: this._description,
            type_of_block: this._typeOfBlock,
            block_version: this._blockVersion
        });
    }

    public setDesignJson(designJson:string) {
        let dj = null;
        try {
            dj = JSON.parse(designJson);
        } catch (e) {
            // TODO: maybe do something
        }

        if (dj && dj["backgroundColor"]) {
            this._backgroundColor = dj["backgroundColor"]
        } else {
            this._backgroundColor = "#36c6d3";
        }
        if (dj && dj["displayName"]) {
            this._displayName = dj["displayName"];
        } else {
            this._displayName = "fa-question-circle-o";
        }
        if (dj && dj["description"]) {
            this._description = dj["description"];
        } else {
            this._description = null;
        }
        if (dj && dj["type_of_block"]) {
            this._typeOfBlock = dj["type_of_block"];
        } else {
            this._typeOfBlock = null;
        }
        if (dj && dj["block_version"]) {
            this._blockVersion = dj["block_version"];
        } else {
            this._blockVersion = null;
        }
        
        if (this.renderer) this.renderer.refresh();
    }

    public remove():void {
        if (this._tsBlockLib) { this._tsBlockLib.callDestroy(); }

        if (this._machine) { this._machine.terminate(); }
        super.remove();
    }

    public setCode(tsCode:string) {
        this._tsCode = tsCode;
        this.run((this.controller)?this.controller.safeRun:false);
    }

    protected cleanBlock() {
        let inputConnectors = this.getInputConnectors().slice(0);
        let outputConnectors = this.getOutputConnectors().slice(0);

        let configProperties = this.getConfigProperties().slice(0);

        inputConnectors.forEach((ic) => {
            this.removeInputConnector(ic);
        });
        outputConnectors.forEach((oc) => {
            this.removeOutputConnector(oc);
        });
        configProperties.forEach((cp) => {
            this.removeConfigProperty(cp);
        });

    }

    protected runError = (e) => {
        this._tsCodeError = true;
        if (this.renderer) this.renderer.refresh();
        if (this.controller) {
            this.controller._emitError(this, e);
        }
    };

    private storedInputs:{ name:string, type:number, otherConnector:Connector, argTypes:string }[] = [];
    private storedOutputs:{ name:string, type:number, otherConnector:Connector, argTypes:string }[] = [];

    private storeConnections() {

        this.storedInputs = [];
        this.inputConnectors.forEach((c) => {
            c.connections.forEach((cc) => {
                let otherC = cc.getOtherConnector(c);
                let out = {
                    name: c.name,
                    type: c.type,
                    otherConnector: otherC,
                    argTypes: c.stringArgTypes.join(",")
                };
                this.storedInputs.push(out);
            });
        });

        this.storedOutputs = [];
        this.outputConnectors.forEach((c) => {
            c.connections.forEach((cc) => {
                let otherC = cc.getOtherConnector(c);
                let out = {
                    name: c.name,
                    type: c.type,
                    otherConnector: otherC,
                    argTypes: c.stringArgTypes.join(",")
                };
                this.storedOutputs.push(out);
            });
        });

    }

    private restoreConnections() {

        this.storedInputs.forEach((si) => {
            let c = this.getInputConnectorByName(si.name);
            if (c) {
                if (si.type == c.type && si.argTypes == c.stringArgTypes.join(",")) {
                    c.connect(si.otherConnector);
                }
            }
        });

        this.storedOutputs.forEach((si) => {
            let c = this.getOutputConnectorByName(si.name);
            if (c) {
                if (si.type == c.type && si.argTypes == c.stringArgTypes.join(",")) {
                    c.connect(si.otherConnector);
                }
            }
        });

        this.storedInputs = [];
        this.storedOutputs = [];
    }

    public run(safe:boolean = false) {

        this.storeConnections();

        if (this._tsBlockLib) { this._tsBlockLib.callDestroy(); }

        if (this._machine) { this._machine.terminate(); }

        this.cleanBlock();

        this._tsCodeError = false;
        if (this.renderer) this.renderer.refresh();

        let transpileModule = null;

        if (typeof ts === "undefined" && typeof require === "function") {
            const typescriptModuleName = "typescript";
            transpileModule = eval("require(typescriptModuleName).transpileModule");
        } else {
            transpileModule = ts.transpileModule;
        }

        let typeScriptCodeLayer = new TypeScriptCodeLayer(transpileModule, this._tsCode);
        typeScriptCodeLayer.setOnError(this.runError);

        this.canAddsIO = true;
        if (safe) {

            let safeCodeLayer = new SafeCodeLayer(typeScriptCodeLayer);
            this._machine.include(safeCodeLayer.lib);
            this._machine.run(safeCodeLayer);

        } else {

            this._machine.run(typeScriptCodeLayer);

        }
        this.canAddsIO = false;

        if (this._tsCodeError) {
            this.cleanBlock();
        } else {
            this._tsBlockLib.callReady();
            this.restoreConnections();
        }

        if (this.renderer) this.renderer.refresh();

    }

    public configChanged() {
        if (this._tsBlockLib) {
            this._tsBlockLib.configChanged();
        }
    }

    protected inputChanged(connector:Connector, eventType:ConnectorEventType, value:boolean|number|Message):void {
        super.inputChanged(connector, eventType, value);
        if (this._tsBlockLib) {
            if (connector) {
                this._tsBlockLib.inputEvent(connector, eventType, value);
            }
        }
    }

    /**
     * call this to machine before connectors is connected
     */
    public callReady() {
        if (this._tsBlockLib) {
            this._tsBlockLib.callReady();
        }
    }

    public rendererGetDisplayName():string {
        if (this._tsCodeError) {
            return "fa-exclamation-triangle";
        }
        return this._displayName;
    }

    public rendererGetBlockBackgroundColor():string {
        if (this._tsCodeError) {
            return "#c00";
        }
        return this._backgroundColor;
    }


    public rendererGetBlockDescription(): string {
        if (this._tsCodeError) {
            return "TypeScript Error";
        }
        return this._description;
    }

    public rendererGetCodeName(): string {
        return "TS";
    }

    public setError(enabled: boolean) {
        this._tsCodeError = enabled;
        if (this.renderer) this.renderer.refresh();
    }

}