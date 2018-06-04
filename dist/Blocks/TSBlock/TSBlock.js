"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Core = require("../../Core/index");
const script_engine_1 = require("script-engine");
const TSBlockLib_1 = require("../Libraries/TSBlockLib");
const ServiceLib_1 = require("../Libraries/ServiceLib");
const FetchLib_1 = require("../Libraries/FetchLib");
const common_lib_1 = require("common-lib");
const DatabaseLib_1 = require("../Libraries/DatabaseLib");
class TSBlock extends Core.Block {
    constructor(id, tsCode, designJson) {
        super(id, 'tsBlock', 'tsBlock');
        this._tsCode = '';
        this._tsCodeError = false;
        this._machine = null;
        this._utilsLib = null;
        this._tsBlockLib = null;
        this._consoleLib = null;
        this._serviceLib = null;
        this._fetchLib = null;
        this._dbLib = null;
        this._displayName = '';
        this._backgroundColor = '';
        this._description = null;
        this.canAddsIO = false;
        this.onLog = (type, message) => {
            if (this.controller) {
                this.controller._emitLog(this, type, message);
            }
        };
        this.runError = (e) => {
            this._tsCodeError = true;
            if (this.renderer) {
                this.renderer.refresh();
            }
            if (this.controller) {
                this.controller._emitError(this, e);
            }
        };
        this.storedInputs = [];
        this.storedOutputs = [];
        this._codeBlock = true;
        if (!tsCode) {
            tsCode = '';
            this._tsCodeError = true;
        }
        if (!designJson) {
            designJson = '{}';
        }
        this._tsCode = tsCode;
        this.setDesignJson(designJson);
    }
    afterControllerSet() {
        this._machine = new script_engine_1.Machine();
        this._tsBlockLib = new TSBlockLib_1.TSBlockLib(this);
        this._utilsLib = new common_lib_1.Libs.UtilsLib(!this.controller.configuration.asyncEventsEnabled);
        this._consoleLib = new common_lib_1.Libs.ConsoleLib();
        this._fetchLib = new FetchLib_1.FetchLib();
        this._dbLib = new DatabaseLib_1.DatabaseLib();
        this._serviceLib = new ServiceLib_1.ServiceLib(this.controller.servicesHandler);
        this._consoleLib.setOnLog(this.onLog);
        this._machine.include(this._utilsLib);
        this._machine.include(this._tsBlockLib);
        this._machine.include(this._consoleLib);
        this._machine.include(this._fetchLib);
        this._machine.include(this._dbLib);
        this._machine.include(this._serviceLib);
        if (this._tsCode) {
            this.setCode(this._tsCode);
        }
    }
    get code() {
        return this._tsCode;
    }
    get codeError() {
        return this._tsCodeError;
    }
    get designJson() {
        return JSON.stringify({
            displayName: this._displayName,
            backgroundColor: this._backgroundColor,
            description: this._description,
            version_id: this._versionId,
            block_id: this._blockId
        });
    }
    setDesignJson(designJson) {
        let dj = null;
        try {
            dj = JSON.parse(designJson);
        }
        catch (e) {
        }
        if (dj) {
            if (dj['backgroundColor']) {
                this._backgroundColor = dj['backgroundColor'];
            }
            else {
                this._backgroundColor = '#36c6d3';
            }
            if (dj['displayName']) {
                this._displayName = dj['displayName'];
            }
            else {
                this._displayName = 'fa-question-circle-o';
            }
            if (dj['description']) {
                this._description = dj['description'];
            }
            else {
                this._description = null;
            }
            if (dj['version_id']) {
                this._versionId = dj['version_id'];
            }
            else if (dj['block_version']) {
                this._versionId = dj['block_version'];
            }
            else {
                this._versionId = null;
            }
            if (dj['block_id']) {
                this._blockId = dj['block_id'];
            }
            else {
                this._blockId = null;
            }
        }
        if (this.renderer) {
            this.renderer.refresh();
        }
    }
    remove() {
        if (this._tsBlockLib) {
            this._tsBlockLib.callDestroy();
        }
        if (this._machine) {
            this._machine.terminate();
        }
        super.remove();
    }
    setCode(tsCode) {
        this._tsCode = tsCode;
        this.run((this.controller) ? this.controller.safeRun : false);
    }
    cleanBlock() {
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
    storeConnections() {
        this.storedInputs = [];
        this.inputConnectors.forEach((c) => {
            c.connections.forEach((cc) => {
                let otherC = cc.getOtherConnector(c);
                let out = {
                    name: c.id,
                    type: c.type,
                    otherConnector: otherC,
                    argTypes: c.isMessage() ? c.stringArgTypes.join(',') : ''
                };
                this.storedInputs.push(out);
            });
        });
        this.storedOutputs = [];
        this.outputConnectors.forEach((c) => {
            c.connections.forEach((cc) => {
                let otherC = cc.getOtherConnector(c);
                let out = {
                    name: c.id,
                    type: c.type,
                    otherConnector: otherC,
                    argTypes: c.isMessage() ? c.stringArgTypes.join(',') : ''
                };
                this.storedOutputs.push(out);
            });
        });
    }
    restoreConnections() {
        this.storedInputs.forEach((si) => {
            let c = this.getInputConnectorById(si.name);
            if (c) {
                if (si.type === c.type && si.argTypes === (c.isMessage() ? c.stringArgTypes.join(',') : '')) {
                    c.connect(si.otherConnector);
                }
            }
        });
        this.storedOutputs.forEach((si) => {
            let c = this.getOutputConnectorById(si.name);
            if (c) {
                if (si.type === c.type && si.argTypes === (c.isMessage() ? c.stringArgTypes.join(',') : '')) {
                    c.connect(si.otherConnector);
                }
            }
        });
        this.storedInputs = [];
        this.storedOutputs = [];
    }
    run(safe = false) {
        this.storeConnections();
        if (this._tsBlockLib) {
            this._tsBlockLib.callDestroy();
        }
        if (this._machine) {
            this._machine.terminate();
        }
        this.cleanBlock();
        this._tsCodeError = false;
        if (this.renderer) {
            this.renderer.refresh();
        }
        let transpileModule = null;
        if (typeof ts === 'undefined' && typeof require === 'function') {
            const typescriptModuleName = 'typescript';
            transpileModule = eval('require(typescriptModuleName).transpileModule');
        }
        else {
            transpileModule = ts.transpileModule;
        }
        let typeScriptCodeLayer = new script_engine_1.TypeScriptCodeLayer(transpileModule, this._tsCode);
        typeScriptCodeLayer.setOnError(this.runError);
        this.canAddsIO = true;
        if (safe) {
            let safeCodeLayer = new script_engine_1.SafeCodeLayer(typeScriptCodeLayer);
            this._machine.include(safeCodeLayer.lib);
            this._machine.run(safeCodeLayer);
        }
        else {
            this._machine.run(typeScriptCodeLayer);
        }
        this.canAddsIO = false;
        if (this._tsCodeError) {
            this.cleanBlock();
        }
        else {
            this._tsBlockLib.callReady();
            if (this.renderer) {
                this.renderer.refresh();
            }
            this.restoreConnections();
        }
        if (this.renderer) {
            this.renderer.refresh();
        }
    }
    configChanged() {
        if (this._tsBlockLib) {
            this._tsBlockLib.configChanged();
        }
    }
    inputChanged(event) {
        super.inputChanged(event);
        if (this._tsBlockLib) {
            if (event.connector) {
                this._tsBlockLib.inputEvent(event);
            }
        }
    }
    callReady() {
        if (this._tsBlockLib) {
            this._tsBlockLib.callReady();
        }
    }
    rendererGetDisplayName() {
        if (this._tsCodeError) {
            return 'ERROR!';
        }
        return this._displayName;
    }
    rendererGetCodeName() {
        return 'TS';
    }
    setError(enabled) {
        this._tsCodeError = enabled;
        if (this.renderer) {
            this.renderer.refresh();
        }
    }
}
exports.TSBlock = TSBlock;
