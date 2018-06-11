import * as Core from '../../Core/index';
import { Connector } from '../../Core/Connector';
import { Machine, TypeScriptCodeLayer, SafeCodeLayer } from 'script-engine';
import { TSBlockLib } from '../Libraries/TSBlockLib';
import { ServiceLib } from '../Libraries/ServiceLib';
import { FetchLib } from '../Libraries/FetchLib';
import { Libs } from 'common-lib';
import { ConnectorEvent, MessageConnector } from '../../Core';
import { DatabaseLib } from '../Libraries/DatabaseLib';
import { Message } from '../../Core/Message';
import { RuntimeErrorEvent } from '../../Core/Events';

declare let ts;
declare const require;

export class TSBlock extends Core.Block {

    private _tsCode: string = '';
    private _tsCodeError = false;

    private _machine: Machine = null;
    private _utilsLib: Libs.UtilsLib = null;
    private _tsBlockLib: TSBlockLib = null;
    private _consoleLib: Libs.ConsoleLib = null;
    private _serviceLib: ServiceLib = null;
    private _fetchLib: FetchLib = null;
    private _dbLib: DatabaseLib = null;

    protected _blockId: string = null; // Id assigned from tyrion
    protected _versionId: string = null; // Id assigned from tyrion

    public canAddsIO = false;

    public constructor(id: string, tsCode?: string) {
        super(id, 'tsBlock');
        this._codeBlock = true;

        if (!tsCode) {
            tsCode = '';
            this._tsCodeError = true;
        }

        this._tsCode = tsCode;
    }

    public initialize(): void {
        if (this._tsCode) {
            this.setCode(this._tsCode);
        }
    }

    public getDataJson(): object {
        let data: object = super.getDataJson();
        data['code'] = this._tsCode;
        data['block_id'] = this._blockId;
        data['version_id'] = this._versionId;
        return data;
    }

    public setDataJson(data: object): void {
        super.setDataJson(data);

        // For backwards compatibility
        if (data['designJson']) {
            let old: object = data['designJson'];

            if (old['displayName']) {
                this.name = old['displayName'];
            } else {
                this.name = 'Unknown';
            }

            if (old['description']) {
                this.description = old['description'];
            }

            if (old['block_id']) {
                this._blockId = old['block_id'];
            }

            if (old['version_id']) {
                this._versionId = old['version_id'];
            } else if (old['block_version']) {
                this._versionId = old['block_version'];
            }

        } else {
            if (data['code']) {
                this._tsCode = data['code'];
            }

            if (data['block_id']) {
                this._blockId = data['block_id'];
            }

            if (data['version_id']) {
                this._versionId = data['version_id'];
            }
        }
    }

    protected afterControllerSet() {
        this._machine = new Machine();
        this._tsBlockLib = new TSBlockLib(this);
        this._utilsLib = new Libs.UtilsLib(!this.controller.configuration.asyncEventsEnabled);
        this._consoleLib = new Libs.ConsoleLib();
        this._fetchLib = new FetchLib();
        this._dbLib = new DatabaseLib();
        this._serviceLib = new ServiceLib(this.controller.servicesHandler);

        this._consoleLib.setOnLog(this.onLog);
        this._machine.include(this._utilsLib);
        this._machine.include(this._tsBlockLib);
        this._machine.include(this._consoleLib);
        this._machine.include(this._fetchLib);
        this._machine.include(this._dbLib);
        this._machine.include(this._serviceLib);
    }

    protected onLog = (type: string, message: string) => {
        if (this.controller) {
            this.controller._emitLog(this, type, message);
        }
    };

    get code(): string {
        return this._tsCode;
    }

    get codeError(): boolean {
        return this._tsCodeError;
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

    public remove(): void {
        if (this._tsBlockLib) { this._tsBlockLib.callDestroy(); }

        if (this._machine) { this._machine.terminate(); }
        super.remove();
    }

    public setCode(tsCode: string) {
        this._tsCode = tsCode;
        this.run((this.controller) ? this.controller.safeRun : false);
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
        this.emit(this, new RuntimeErrorEvent());
        if (this.controller) {
            this.controller._emitError(this, e);
        }
    };

    private storedInputs: { name: string, type: number, otherConnector: Connector<boolean|number|object|Message>, argTypes: string }[] = [];
    private storedOutputs: { name: string, type: number, otherConnector: Connector<boolean|number|object|Message>, argTypes: string }[] = [];

    private storeConnections() {

        this.storedInputs = [];
        this.inputConnectors.forEach((c) => {
            c.connections.forEach((cc) => {
                let otherC = cc.getOtherConnector(c);
                let out = {
                    name: c.id,
                    type: c.type,
                    otherConnector: otherC,
                    argTypes: c.isMessage() ? (<MessageConnector>c).stringArgTypes.join(',') : ''
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
                    argTypes: c.isMessage() ? (<MessageConnector>c).stringArgTypes.join(',') : ''
                };
                this.storedOutputs.push(out);
            });
        });

    }

    private restoreConnections() {

        this.storedInputs.forEach((si) => {
            let c = this.getInputConnectorById(si.name);
            if (c) {
                if (si.type === c.type && si.argTypes === (c.isMessage() ? (<MessageConnector>c).stringArgTypes.join(',') : '')) {
                    c.connect(si.otherConnector);
                }
            }
        });

        this.storedOutputs.forEach((si) => {
            let c = this.getOutputConnectorById(si.name);
            if (c) {
                if (si.type === c.type && si.argTypes === (c.isMessage() ? (<MessageConnector>c).stringArgTypes.join(',') : '')) {
                    c.connect(si.otherConnector);
                }
            }
        });

        this.storedInputs = [];
        this.storedOutputs = [];
    }

    public run(safe: boolean = false) {

        this.storeConnections();

        if (this._tsBlockLib) { this._tsBlockLib.callDestroy(); }

        if (this._machine) { this._machine.terminate(); }

        this.cleanBlock();

        this._tsCodeError = false;
        // TODO render refresh?

        let transpileModule = null;

        if (typeof ts === 'undefined' && typeof require === 'function') {
            const typescriptModuleName = 'typescript';
            /*tslint:disable:no-eval*/
            transpileModule = eval('require(typescriptModuleName).transpileModule');
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

            // TODO render refresh?

            this.restoreConnections();
        }

        // TODO render refresh?
    }

    public configChanged() {
        if (this._tsBlockLib) {
            this._tsBlockLib.configChanged();
        }
    }

    protected inputChanged(event: ConnectorEvent): void {
        super.inputChanged(event);
        if (this._tsBlockLib) {
            if (event.connector) {
                this._tsBlockLib.inputEvent(event);
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

    public rendererGetCodeName(): string {
        return 'TS';
    }

    public setError(enabled: boolean) {
        this._tsCodeError = enabled;
        // TODO render refresh?
    }
}
