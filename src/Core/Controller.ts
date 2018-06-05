import { IBlockRenderer, Block } from './Block';
import { Connection } from './Connection';
import { BlockClass, BlockRegistration } from './BlockRegistration';
import { Connector, ConnectorEventType } from './Connector';
import { ServicesHandler } from '../Blocks/Libraries/ServiceLib';
import { Service } from '../Blocks/Services/Service';
import { ExternalAnalogConnector, ExternalDigitalConnector, ExternalConnector,
    ExternalMessageConnector } from './ExternalConnector';
import { InputsInterfaceBlock, OutputsInterfaceBlock, BlockoTargetInterface } from '../Blocks/InterfaceBlock';
import { TSBlock } from '../Blocks/TSBlock/TSBlock';
import { Message, MessageJson } from './Message';
import { BaseInterfaceBlock, WebHook } from '../Blocks';
import { IRenderer } from './Renderer';
import { Database } from './Database';

export interface IRendererFactory {
    factoryBlockRenderer(block: Block): IBlockRenderer;
    factoryConnectionRenderer(connection: Connection): IRenderer;
}

export interface BlockoInstanceConfig {
    renderController?: IRendererFactory;
    dbConnectionString?: string;
    inputEnabled?: boolean;
    outputEnabled?: boolean;
    asyncEventsEnabled?: boolean;
}

export interface BoundInterface {
    targetId: string;
    interfaceId: string;
    group?: boolean;
}

export class Controller {

    blocksRegister: Array<BlockRegistration>;

    // Blocks storage
    blocks: Array<Block>;
    connections: Array<Connection>;

    public rendererFactory: IRendererFactory;

    public safeRun: boolean = false;

    public gui: boolean = false;

    public configuration: BlockoInstanceConfig = {
        inputEnabled: true,
        outputEnabled: true,
        asyncEventsEnabled: true
    };

    protected _servicesHandler: ServicesHandler;

    public constructor(configuration?: BlockoInstanceConfig) {
        this.blocks = [];
        this.connections = [];
        this.blocksRegister = [];
        this._servicesHandler = new ServicesHandler('BlockoServiceHandler');

        if (configuration) {
            if (configuration.renderController) {
                this.rendererFactory = configuration.renderController
            }

            if (configuration.dbConnectionString) {
                Database.connectionString = configuration.dbConnectionString;
            }
        }
    }

    public registerService(service: Service) {
        this._servicesHandler.addService(service);
    }

    public get servicesHandler(): ServicesHandler {
        return this._servicesHandler;
    }

    public registerBlocks(blocksClass: Array<BlockClass>): void {
        blocksClass.forEach((bc: BlockClass) => {
            this.registerBlock(bc);
        });
    }

    public registerBlock(blockClass: BlockClass): void {
        let b: Block = new blockClass('register');
        let blockRegistration: BlockRegistration = new BlockRegistration(blockClass, b.type, b.visualType, b.rendererGetDisplayName());
        this.blocksRegister.push(blockRegistration);
    }

    public getBlockClassByVisualType(visualType: string): BlockClass {
        let blockClass: BlockClass = null;
        this.blocksRegister.forEach((blockRegistration: BlockRegistration) => {
            if (blockRegistration.visualType === visualType) {
                blockClass = blockRegistration.blockClass;
            }
        });
        return blockClass;
    }

    private blockAddedCallbacks: Array<(block: Block) => void> = [];

    public registerBlockAddedCallback(callback: (block: Block) => void): void {
        this.blockAddedCallbacks.push(callback);
    }

    public addBlock(block: Block) {

        if (!block.id) {
            block.id = this.getFreeBlockId();
        }

        block.registerInputEventCallback((connector: Connector<boolean|number|object|Message>, eventType: ConnectorEventType, value: boolean|number|MessageJson) => this.inputConnectorEvent(connector, eventType, value));
        block.registerOutputEventCallback((connector: Connector<boolean|number|object|Message>, eventType: ConnectorEventType, value: boolean|number|MessageJson) => this.outputConnectorEvent(connector, eventType, value));

        block.registerExternalInputEventCallback((connector: ExternalConnector<any>, eventType: ConnectorEventType, value: boolean|number|Message) => this.externalInputConnectorEvent(connector, eventType, value));
        block.registerExternalOutputEventCallback((connector: ExternalConnector<any>, eventType: ConnectorEventType, value: boolean|number|Message) => this.externalOutputConnectorEvent(connector, eventType, value));

        if (this.factoryBlockRendererCallback) {
            block.renderer = this.factoryBlockRendererCallback(block);
        } else if (this.rendererFactory) {
            block.renderer = this.rendererFactory.factoryBlockRenderer(block);
        }

        block.controller = this;

        this.blocks.push(block);
        this.blockAddedCallbacks.forEach(callback => callback(block));

        block.initialize(); // TODO: only test for defaults!

        // this._emitDataChanged();
    }

    private connectionAddedCallbacks: Array<(connection: Connection) => void> = [];

    public registerConnectionAddedCallback(callback: (connection: Connection) => void): void {
        this.connectionAddedCallbacks.push(callback);
    }

    public _addConnection(connection: Connection) {
        if (this.factoryConnectionRendererCallback) {
            connection.renderer = this.factoryConnectionRendererCallback(connection);
        } else if (this.rendererFactory) {
            connection.renderer = this.rendererFactory.factoryConnectionRenderer(connection);
        }

        this.connections.push(connection);

        if (connection.getInputConnector().isDigital() || connection.getInputConnector().isAnalog()) {
            connection.getInputConnector()._inputSetValue(connection.getOutputConnector().value);
        }

        this.connectionAddedCallbacks.forEach(callback => callback(connection));

        // this._emitDataChanged();
    }

    private connectionRemovedCallbacks: Array<(connection: Connection) => void> = [];

    public registerConnectionRemovedCallback(callback: (connection: Connection) => void): void {
        this.connectionRemovedCallbacks.push(callback);
    }

    public _removeConnection(connection: Connection) {
        let index = this.connections.indexOf(connection);
        if (index > -1) {
            this.connections.splice(index, 1);

            if (connection.getInputConnector().isDigital()) {
                connection.getInputConnector()._inputSetValue(false);
            }
            if (connection.getInputConnector().isAnalog()) {
                connection.getInputConnector()._inputSetValue(0);
            }

            this.connectionRemovedCallbacks.forEach(callback => callback(connection));
        }

        // this._emitDataChanged();
    }

    private blockRemovedCallbacks: Array<(block: Block) => void> = [];

    public registerBlockRemovedCallback(callback: (block: Block) => void): void {
        this.blockRemovedCallbacks.push(callback);
    }

    public _removeBlock(block: Block) {
        let index = this.blocks.indexOf(block);
        if (index > -1) {
            this.blocks.splice(index, 1);
            this.blockRemovedCallbacks.forEach(callback => callback(block));
        }

        // this._emitDataChanged();
    }

    public removeAllBlocks(): void {
        let toDelete: Array<Block> = this.blocks.slice(0);

        toDelete.forEach((block: Block) => {
            block.remove();
        });

        this.blockIndex = 0; // reset block index
        this.interfaceIndex = 0;

        // this._emitDataChanged();
    }

    public getBlockById(id: string): Block {
        let block: Block = null;
        this.blocks.forEach((b: Block) => {
            if (b.id === id) {
                block = b;
            }
        });
        return block;
    }

    private blockIndex = 0;

    public getFreeBlockId(): string {
        let id: string = '';
        do {
            this.blockIndex++;
            id = 'B-' + this.blockIndex;
        } while (this.getBlockById(id) != null);
        return id;
    }

    private interfaceIndex = 0;

    public getInterfaceBlockId(): string {
        let id: string = '';
        do {
            this.interfaceIndex++;
            id = 'I-' + this.interfaceIndex;
        } while (this.getBlockById(id + '-IN') != null);
        return id;
    }

    private factoryBlockRendererCallback: (block: Block) => IBlockRenderer = null;

    public registerFactoryBlockRendererCallback(callback: (block: Block) => IBlockRenderer): void {
        this.factoryBlockRendererCallback = callback;
    }

    private factoryConnectionRendererCallback: (connection: Connection) => IRenderer = null;

    public registerFactoryConnectionRendererCallback(callback: (connection: Connection) => IRenderer): void {
        this.factoryConnectionRendererCallback = callback;
    }

    // Internal connectors

    private inputConnectorEventCallbacks: Array<(block: Block, connector: Connector<boolean|number|object|Message>, eventType: ConnectorEventType, value: boolean|number|MessageJson) => void> = [];

    public registerInputConnectorEventCallback(callback: (block: Block, connector: Connector<boolean|number|object|Message>, eventType: ConnectorEventType, value: boolean|number|MessageJson) => void): void {
        this.inputConnectorEventCallbacks.push(callback);
    }

    private outputConnectorEventCallbacks: Array<(block: Block, connector: Connector<boolean|number|object|Message>, eventType: ConnectorEventType, value: boolean|number|MessageJson) => void> = [];

    public registerOutputConnectorEventCallback(callback: (block: Block, connector: Connector<boolean|number|object|Message>, eventType: ConnectorEventType, value: boolean|number|MessageJson) => void): void {
        this.outputConnectorEventCallbacks.push(callback);
    }

    // External connectors

    private externalInputConnectorEventCallbacks: Array<(block: Block, connector: ExternalConnector<any>, eventType: ConnectorEventType, value: boolean|number|Message) => void> = [];

    public registerExternalInputConnectorEventCallback(callback: (block: Block, connector: ExternalConnector<any>, eventType: ConnectorEventType, value: boolean|number|Message) => void): void {
        this.externalInputConnectorEventCallbacks.push(callback);
    }

    private externalOutputConnectorEventCallbacks: Array<(block: Block, connector: ExternalConnector<any>, eventType: ConnectorEventType, value: boolean|number|Message) => void> = [];

    public registerExternalOutputConnectorEventCallback(callback: (block: Block, connector: ExternalConnector<any>, eventType: ConnectorEventType, value: boolean|number|Message) => void): void {
        this.externalOutputConnectorEventCallbacks.push(callback);
    }

    // Data changes

    /*private dataChangedCallbacks: Array<() => void> = [];

    public registerDataChangedCallback(callback:() => void):void {
        this.dataChangedCallbacks.push(callback);
    }

    public _emitDataChanged() {
        this.dataChangedCallbacks.forEach(callback => callback());
    }*/

    // internal callbacks

    private inputConnectorEvent(connector: Connector<boolean|number|object|Message>, eventType: ConnectorEventType, value: boolean|number|MessageJson): void {
        this.inputConnectorEventCallbacks.forEach(callback => callback(connector.block, connector, eventType, value));
    }

    private outputConnectorEvent(connector: Connector<boolean|number|object|Message>, eventType: ConnectorEventType, value: boolean|number|MessageJson): void {
        this.outputConnectorEventCallbacks.forEach(callback => callback(connector.block, connector, eventType, value));
    }

    private externalInputConnectorEvent(connector: ExternalAnalogConnector|ExternalDigitalConnector|ExternalMessageConnector, eventType: ConnectorEventType, value: boolean|number|Message): void {
        this.externalInputConnectorEventCallbacks.forEach(callback => callback(connector.block, connector, eventType, value));
    }

    private externalOutputConnectorEvent(connector: ExternalAnalogConnector|ExternalDigitalConnector|ExternalMessageConnector, eventType: ConnectorEventType, value: boolean|number|Message): void {
        this.externalOutputConnectorEventCallbacks.forEach(callback => callback(connector.block, connector, eventType, value));
    }

    // Error callback

    private errorCallbacks: Array<(block: Block, error: any) => void> = [];

    public registerErrorCallback(callback: (block: Block, error: any) => void): void {
        this.errorCallbacks.push(callback);
    }

    public _emitError(block: Block, error: any) {
        this.errorCallbacks.forEach(callback => callback(block, error));
    }

    // Log callback

    private logCallbacks: Array<(block: Block, type: string, message: any) => void> = [];

    public registerLogCallback(callback: (block: Block, type: string, message: any) => void): void {
        this.logCallbacks.push(callback);
    }

    public _emitLog(block: Block, type: string, message: any) {
        this.logCallbacks.forEach(callback => callback(block, type, message));
    }

    // value setters

//  From homer... controls only external connectors
    public setDigitalValue(targetId: string, groupIds: string[], name: string, value: boolean): void {
        //  TODO optimise, find target by block, not by connectors in it!
        this.blocks.find(block => {
            let found = false;
            let group = false;
            block.getExternalInputConnectors().find(con => {
                if ((con.targetId === targetId || (groupIds && groupIds.find(i => { if (i === con.targetId) { group = true; return true; } return false; }))) && con.name === name  && con instanceof ExternalDigitalConnector) {
                    found = true;
                    con.setValue(value, group ? targetId : undefined);
                    return true;
                }
                return false;
            });
            return found;
        });
    }

    public setAnalogValue(targetId: string, groupIds: string[], name: string, value: number): void {
        this.blocks.find(block => {
            let found = false;
            let group = false;
            block.getExternalInputConnectors().find(con => {
                if ((con.targetId === targetId || (groupIds && groupIds.find(i => { if (i === con.targetId) { group = true; return true; } return false; }))) && con.name === name  && con instanceof ExternalAnalogConnector) {
                    found = true;
                    con.setValue(value, group ? targetId : undefined);
                    return true;
                }
                return false;
            });
            return found;
        });
    }

    public setMessageValue(targetId: string, groupIds: string[], name: string, message: Message): void {
        this.blocks.find(block => {
            let found = false;
            let group = false;
            block.getExternalInputConnectors().find(con => {
                if ((con.targetId === targetId || (groupIds && groupIds.find(i => { if (i === con.targetId) { group = true; return true; } return false; }))) && con.name === name && con instanceof ExternalMessageConnector) {
                    found = true;
                    con.setValue(message, group ? targetId : undefined);
                    return true;
                }
                return false;
            });
            return found;
        });
    }

    public setWebHookValue(apiKey: string, message: object) {
        if (typeof message === 'object' && !Array.isArray(message)) {
            let webHookBlock: WebHook = <WebHook>this.blocks.find((b) => {
                return b instanceof WebHook && b.apiKey === apiKey;
            });

            if (webHookBlock) {
                webHookBlock.getJsonOutput()._outputSetValue(message);
            } else {
                console.warn('Controller::setWebHookValue - cannot find any WebHook block with apiKey:', apiKey);
            }
        } else {
            console.error('Controller::setWebHookValue - attempt to set wrong value on WebHook, object is required, but got \'' + Array.isArray(message) ? 'array' : typeof message + '\'');
        }
    }

//  For remote view controlling
    public setInputConnectorValue(blockId: string, connectorName: string, value: boolean|number|Message): void {
        this.blocks.forEach((block) => {
            if (block.id === blockId) {
                // TODO what about interface connectors rename? ... m_, d_, a_ ??
                let connector: Connector<boolean|number|object|Message> = block.getInputConnectorById(connectorName);
                if (connector) {
                    connector._inputSetValue(value);
                }
            }
        });
    }

    public setOutputConnectorValue(blockId: string, connectorName: string, value: boolean|number|Message): void {
        this.blocks.forEach((block) => {
            if (block.id === blockId) {
                // TODO what about interface connectors rename? ... m_, d_, a_ ??
                let connector: Connector<boolean|number|object|Message> = block.getOutputConnectorById(connectorName);
                if (connector) {
                    connector._outputSetValue(value);
                }
            }
        });
    }

    public getDigitalInputNames(): Array<any> {
        let ret: Array<any> = [];
        this.blocks.forEach(block => {
            block.getExternalInputConnectors().forEach(connector => {
                if (connector instanceof ExternalDigitalConnector) {
                    ret.push({
                        targetId: connector.targetId,
                        name: connector.name,
                    });
                }
            });
        });
        return ret;
    }

    public getAnalogInputNames(): Array<any> {
        let ret: Array<any> = [];
        this.blocks.forEach(block => {
            block.getExternalInputConnectors().forEach(connector => {
                if (connector instanceof ExternalAnalogConnector) {
                    ret.push({
                        targetId: connector.targetId,
                        name: connector.name,
                    });
                }
            });
        });
        return ret;
    }

    public getMessageInputNames(): Array<any> {
        let ret: Array<any> = [];
        this.blocks.forEach(block => {
            block.getExternalInputConnectors().forEach(connector => {
                if (connector instanceof ExternalMessageConnector) {
                    ret.push({
                        targetId: connector.targetId,
                        name: connector.name,
                    });
                }
            });
        });
        return ret;
    }

    public getDigitalOutputNames(): Array<string> {
        let ret: Array<any> = [];
        this.blocks.forEach(block => {
            block.getExternalOutputConnectors().forEach(connector => {
                if (connector instanceof ExternalDigitalConnector) {
                    ret.push({
                        targetId: connector.targetId,
                        name: connector.name,
                    });
                }
            });
        });
        return ret;
    }

    public getAnalogOutputNames(): Array<string> {
        let ret: Array<any> = [];
        this.blocks.forEach(block => {
            block.getExternalOutputConnectors().forEach(connector => {
                if (connector instanceof ExternalAnalogConnector) {
                    ret.push({
                        targetId: connector.targetId,
                        name: connector.name,
                    });
                }
            });
        });
        return ret;
    }

    public getMessageOutputNames(): Array<string> {
        let ret: Array<any> = [];
        this.blocks.forEach(block => {
            block.getExternalOutputConnectors().forEach(connector => {
                if (connector instanceof ExternalMessageConnector) {
                    ret.push({
                        targetId: connector.targetId,
                        name: connector.name,
                    });
                }
            });
        });
        return ret;
    }

    //  error state
    public setError(blockId: string, enabled: boolean) {
        this.blocks.forEach(block => {
            if (block.id === blockId) {
                (<TSBlock>block).setError(enabled);
            }
        });
    }

    // interfaces

    public addInterface(iface: BlockoTargetInterface): void {
        if (typeof iface !== 'object') {
            console.error('Controller::addInterface - invalid interface');
            return;
        }

        if ((!iface.code && !iface.grid) || (iface.code && iface.grid)) {
            console.error('Controller::addInterface - \'code\' and \'grid\' property are both (un)defined, you must define exactly one of them');
            return;
        }

        let id = this.getInterfaceBlockId();

        this.addBlock(new InputsInterfaceBlock(id + '-IN', iface));
        this.addBlock(new OutputsInterfaceBlock(id + '-OUT', iface));
    }

    /**
     * Binds specific HW or HW group to the given interface block.
     * @param {BaseInterfaceBlock} block to bind to
     * @param {string} targetId of WH
     * @param {boolean} group
     */
    public bindInterface(block: BaseInterfaceBlock, targetId: string, group?: boolean): BoundInterface {
        if (block.interfaceId !== block.targetId) {
            let other = block.getOther();

            block.setTargetId(targetId);
            other.setTargetId(targetId);

            if (group) {
                block.group = group;
                other.group = group;
            }

            block.renderer.refresh();
            other.renderer.refresh();

            return {
                targetId: targetId,
                interfaceId: block.interfaceId,
                group: block.group
            }

        } else {
            console.warn('Controller::bindInterface - not found block');
            // TODO throw some error or tell why is not added
            return null;
        }
    }

    /**
     * Gets all interfaces that were bound to hardware or grid
     * @returns {Array<BoundInterface>}
     */
    public getBindings(): Array<BoundInterface> {
        let bindings: Array<BoundInterface> = [];

        this.blocks.filter((block) => {
            return block instanceof BaseInterfaceBlock && block.isInput() && block.targetId && !block.isGrid();
        }).forEach((block: BaseInterfaceBlock) => {
            bindings.push({
                interfaceId: block.interfaceId,
                targetId: block.targetId,
                group: block.group
            });
        });

        return bindings;
    }

    protected hardwareRestartCallback: (targetId: string) => void;

    public registerHardwareRestartCallback(callback: (targetId: string) => void): void {
        this.hardwareRestartCallback = callback;
    }

    public callHardwareRestartCallback(targetId: string): void {
        if (this.hardwareRestartCallback) {
            this.hardwareRestartCallback(targetId);
        }
    }

    public setHardwareNetworkStatus(targetId: string, groupIds: Array<string>, online: boolean) {
        if (targetId && typeof online === 'boolean') {
            let block: OutputsInterfaceBlock = <OutputsInterfaceBlock>this.blocks.find(b => {
                return b instanceof OutputsInterfaceBlock && b.interface.code && (b.targetId === targetId || (groupIds && groupIds.indexOf(b.targetId) !== -1))
            });

            if (block) {
                let connector: Connector<boolean> = block.getNetworkStatusOutput();
                if (connector) {
                    connector._outputSetValue(online, block.group ? targetId : null);
                }
            }
        } else {
            console.warn('Controller::setHardwareNetworkStatus - invalid values, got targetId:', targetId, 'and online:', online)
        }
    }

    // Saving and loading
    public getDataJson(): string {
        let json: any = {
            blocks: {}
        };

        this.blocks.forEach((block: Block) => {
            let blockJson: any = {
                editor: {},
                outputs: {}
            };
            blockJson['type'] = block.type;
            blockJson['visualType'] = block.visualType;

            blockJson['config'] = block.getConfigData();

            blockJson['editor']['x'] = block.x;
            blockJson['editor']['y'] = block.y;

            let outputs: Array<Connector<boolean|number|object|Message>> = block.getOutputConnectors();
            outputs.forEach((connector: Connector<boolean|number|object|Message>) => {
                let connectionsJson: Array<any> = [];

                connector.connections.forEach((connection: Connection) => {
                    let otherConnector: Connector<boolean|number|object|Message> = connection.getOtherConnector(connector);
                    connectionsJson.push({
                        'block': otherConnector.block.id,
                        'connector': otherConnector.id
                    })
                });

                blockJson['outputs'][connector.id] = connectionsJson;
            });

            if (block instanceof BaseInterfaceBlock) {
                blockJson['interface'] = block.interface;
                blockJson['targetId'] = block.targetId;
                blockJson['group'] = block.group;
            }

            if (block instanceof TSBlock) {
                blockJson['code'] = block.code;
                blockJson['designJson'] = block.designJson;
            }

            json['blocks'][block.id] = blockJson;
        });

        return JSON.stringify(json);
    }

    public setDataJson(jsonString: string): string {

        try {
            // Begin of load
            let json: any = JSON.parse(jsonString);

            // TODO: make it better!

            if (json && json['blocks']) {
                this.removeAllBlocks();

                let blocks: any = json['blocks'];

                // first pass - init blocks
                for (let id in blocks) {
                    if (blocks.hasOwnProperty(id)) {
                        let block: any = blocks[id];

                        let bc: BlockClass = this.getBlockClassByVisualType(block['visualType']);

                        let blockObj: Block = null;
                        if (bc === TSBlock) {
                            blockObj = new TSBlock(id, '', block['designJson']);
                        } else {
                            blockObj = new bc(id);
                        }

                        if (block['interface'] && blockObj instanceof BaseInterfaceBlock) {
                            blockObj.setInterface(block['interface']);
                            if (block['targetId']) {
                                blockObj.setTargetId(block['targetId']);
                            }
                            if (block['group']) {
                                blockObj.group = block['group'];
                            }
                        }

                        blockObj.x = block['editor']['x'];
                        blockObj.y = block['editor']['y'];

                        this.addBlock(blockObj);

                        if (blockObj instanceof TSBlock) {
                            blockObj.setCode(block['code']);
                        }
                        blockObj.setConfigData(block['config']);
                    }
                }

                // second pass - connecting
                for (let id in blocks) {
                    if (blocks.hasOwnProperty(id)) {
                        let block: any = blocks[id];

                        let b1: Block = this.getBlockById(id);

                        let outputs = block['outputs'];
                        for (let outputName in outputs) {
                            if (outputs.hasOwnProperty(outputName)) {

                                let connections: Array<any> = outputs[outputName];
                                connections.forEach((connParams: any) => {

                                    let b2name = connParams['block'];
                                    let inputName = connParams['connector'];

                                    let c1: Connector<boolean|number|object|Message> = b1.getOutputConnectorById(outputName);
                                    let b2: Block = this.getBlockById(b2name);
                                    let c2: Connector<boolean|number|object|Message> = b2.getInputConnectorById(inputName);

                                    c1.connect(c2);
                                });
                            }
                        }
                    }
                }
            }
            // this._emitDataChanged();
            // End of load
        } catch (error) {
            this.removeAllBlocks();
            // console.error(error);
            return error;
        }
        return 'OK';
    }

    public isDeployable(): boolean {
        let index: number = this.blocks.findIndex((b) => {
            return b instanceof BaseInterfaceBlock && !b.targetId;
        });

        return index === -1;
    }
}
