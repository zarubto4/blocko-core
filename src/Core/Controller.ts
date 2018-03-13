import {IBlockRenderer, Block} from './Block';
import {Connection, IConnectionRenderer} from './Connection';
import {BlockClass, BlockRegistration} from './BlockRegistration';
import {Connector, ConnectorEventType} from './Connector';
import {ServicesHandler} from '../Blocks/Libraries/ServiceLib';
import {Service} from '../Blocks/Services/Service';
import { ExternalAnalogConnector, ExternalDigitalConnector, ExternalConnector, 
    ExternalMessageConnector } from './ExternalConnector';
import { InputsInterfaceBlock, OutputsInterfaceBlock, BlockoTargetInterface } from '../Blocks/InterfaceBlock';
import {TSBlock} from '../Blocks/TSBlock/TSBlock';
import { Message, MessageJson } from './Message';
import { BaseInterfaceBlock } from '../Blocks';

export interface IRendererFactory {
    factoryBlockRenderer(block:Block): IBlockRenderer;
    factoryConnectionRenderer(connection:Connection): IConnectionRenderer;
}

export interface BlockoInstanceConfig {
    inputEnabled: boolean;
    outputEnabled: boolean;
    asyncEventsEnabled: boolean;
}

export interface BoundInterface {
    targetId: string;
    interfaceId: string;
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

    public constructor() {
        this.blocks = [];
        this.connections = [];
        this.blocksRegister = [];
        this._servicesHandler = new ServicesHandler('BlockoServiceHandler');
    }

    public registerService(service: Service) {
        this._servicesHandler.addService(service);
    }

    public get servicesHandler(): ServicesHandler {
        return this._servicesHandler;
    }

    public registerBlocks(blocksClass: Array<BlockClass>): void {
        blocksClass.forEach((bc:BlockClass) => {
            this.registerBlock(bc);
        });
    }

    public registerBlock(blockClass: BlockClass): void {
        let b:Block = new blockClass('register');
        let blockRegistration:BlockRegistration = new BlockRegistration(blockClass, b.type, b.visualType, b.rendererGetDisplayName());
        this.blocksRegister.push(blockRegistration);
    }

    public getBlockClassByVisualType(visualType: string): BlockClass {
        let blockClass:BlockClass = null;
        this.blocksRegister.forEach((blockRegistration:BlockRegistration) => {
            if (blockRegistration.visualType == visualType) {
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

        block.registerInputEventCallback((connector:Connector, eventType:ConnectorEventType, value:boolean|number|MessageJson) => this.inputConnectorEvent(connector, eventType, value));
        block.registerOutputEventCallback((connector:Connector, eventType:ConnectorEventType, value:boolean|number|MessageJson) => this.outputConnectorEvent(connector, eventType, value));

        block.registerExternalInputEventCallback((connector:ExternalConnector<any>, eventType:ConnectorEventType, value:boolean|number|Message) => this.externalInputConnectorEvent(connector, eventType, value));
        block.registerExternalOutputEventCallback((connector:ExternalConnector<any>, eventType:ConnectorEventType, value:boolean|number|Message) => this.externalOutputConnectorEvent(connector, eventType, value));

        if (this.factoryBlockRendererCallback) {
            block.renderer = this.factoryBlockRendererCallback(block);
        } else if (this.rendererFactory) {
            block.renderer = this.rendererFactory.factoryBlockRenderer(block);
        }

        block.controller = this;

        this.blocks.push(block);
        this.blockAddedCallbacks.forEach(callback => callback(block));

        block.initialize(); // TODO: only test for defaults!

        //this._emitDataChanged();
    }

    private connectionAddedCallbacks:Array<(connection: Connection) => void> = [];

    public registerConnectionAddedCallback(callback:(connection: Connection) => void): void {
        this.connectionAddedCallbacks.push(callback);
    }

    public _addConnection(connection: Connection) {
        if (this.factoryConnectionRendererCallback) {
            connection.renderer = this.factoryConnectionRendererCallback(connection);
        } else if (this.rendererFactory) {
            connection.renderer = this.rendererFactory.factoryConnectionRenderer(connection);
        }

        this.connections.push(connection);
        this.connectionAddedCallbacks.forEach(callback => callback(connection));

        //this._emitDataChanged();
    }

    private connectionRemovedCallbacks:Array<(connection: Connection) => void> = [];

    public registerConnectionRemovedCallback(callback:(connection: Connection) => void): void {
        this.connectionRemovedCallbacks.push(callback);
    }

    public _removeConnection(connection: Connection) {
        let index = this.connections.indexOf(connection);
        if (index > -1) {
            this.connections.splice(index, 1);
            this.connectionRemovedCallbacks.forEach(callback => callback(connection));
        }

        //this._emitDataChanged();
    }

    private blockRemovedCallbacks:Array<(block: Block) => void> = [];

    public registerBlockRemovedCallback(callback:(block: Block) => void): void {
        this.blockRemovedCallbacks.push(callback);
    }

    public _removeBlock(block: Block) {
        let index = this.blocks.indexOf(block);
        if (index > -1) {
            this.blocks.splice(index, 1);
            this.blockRemovedCallbacks.forEach(callback => callback(block));
        }

        //this._emitDataChanged();
    }

    public removeAllBlocks(): void {
        let toDelete:Array<Block> = this.blocks.slice(0);

        toDelete.forEach((block:Block) => {
            block.remove();
        });

        this.blockIndex = 0; // reset block index
        this.interfaceIndex = 0;

        //this._emitDataChanged();
    }

    public getBlockById(id: string): Block {
        let block:Block = null;
        this.blocks.forEach((b:Block) => {
            if (b.id == id) {
                block = b;
            }
        });
        return block;
    }

    private blockIndex = 0;

    public getFreeBlockId(): string {
        let id:string = '';
        do {
            this.blockIndex++;
            id = 'B-' + this.blockIndex;
        } while (this.getBlockById(id) != null);
        return id;
    }

    private interfaceIndex = 0;

    public getInterfaceBlockId(): string {
        let id:string = '';
        do {
            this.interfaceIndex++;
            id = 'I-' + this.interfaceIndex;
        } while (this.getBlockById(id + '-IN') != null);
        return id;
    }

    private factoryBlockRendererCallback:(block: Block) => IBlockRenderer = null;

    public registerFactoryBlockRendererCallback(callback: (block: Block) => IBlockRenderer): void {
        this.factoryBlockRendererCallback = callback;
    }

    private factoryConnectionRendererCallback:(connection:Connection) => IConnectionRenderer = null;

    public registerFactoryConnectionRendererCallback(callback:(connection:Connection) => IConnectionRenderer):void {
        this.factoryConnectionRendererCallback = callback;
    }

    // Internal connectors

    private inputConnectorEventCallbacks:Array<(block:Block, connector:Connector, eventType:ConnectorEventType, value:boolean|number|MessageJson) => void> = [];

    public registerInputConnectorEventCallback(callback:(block:Block, connector:Connector, eventType:ConnectorEventType, value:boolean|number|MessageJson) => void):void {
        this.inputConnectorEventCallbacks.push(callback);
    }

    private outputConnectorEventCallbacks:Array<(block:Block, connector:Connector, eventType:ConnectorEventType, value:boolean|number|MessageJson) => void> = [];

    public registerOutputConnectorEventCallback(callback:(block:Block, connector:Connector, eventType:ConnectorEventType, value:boolean|number|MessageJson) => void):void {
        this.outputConnectorEventCallbacks.push(callback);
    }

    // External connectors
    
    private externalInputConnectorEventCallbacks:Array<(block:Block, connector:ExternalConnector<any>, eventType:ConnectorEventType, value:boolean|number|Message) => void> = [];

    public registerExternalInputConnectorEventCallback(callback:(block:Block, connector:ExternalConnector<any>, eventType:ConnectorEventType, value:boolean|number|Message) => void):void {
        this.externalInputConnectorEventCallbacks.push(callback);
    }

    private externalOutputConnectorEventCallbacks:Array<(block:Block, connector:ExternalConnector<any>, eventType:ConnectorEventType, value:boolean|number|Message) => void> = [];

    public registerExternalOutputConnectorEventCallback(callback:(block:Block, connector:ExternalConnector<any>, eventType:ConnectorEventType, value:boolean|number|Message) => void):void {
        this.externalOutputConnectorEventCallbacks.push(callback);
    }

    // Data changes

    /*private dataChangedCallbacks:Array<() => void> = [];

    public registerDataChangedCallback(callback:() => void):void {
        this.dataChangedCallbacks.push(callback);
    }

    public _emitDataChanged() {
        this.dataChangedCallbacks.forEach(callback => callback());
    }*/

    // internal callbacks

    private inputConnectorEvent(connector:Connector, eventType:ConnectorEventType, value:boolean|number|MessageJson):void {
        this.inputConnectorEventCallbacks.forEach(callback => callback(connector.block, connector, eventType, value));
    }

    private outputConnectorEvent(connector:Connector, eventType:ConnectorEventType, value:boolean|number|MessageJson):void {
        this.outputConnectorEventCallbacks.forEach(callback => callback(connector.block, connector, eventType, value));
    }

    private externalInputConnectorEvent(connector:ExternalAnalogConnector|ExternalDigitalConnector|ExternalMessageConnector, eventType:ConnectorEventType, value:boolean|number|Message):void {
        this.externalInputConnectorEventCallbacks.forEach(callback => callback(connector.block, connector, eventType, value));
    }

    private externalOutputConnectorEvent(connector:ExternalAnalogConnector|ExternalDigitalConnector|ExternalMessageConnector, eventType:ConnectorEventType, value:boolean|number|Message):void {
        this.externalOutputConnectorEventCallbacks.forEach(callback => callback(connector.block, connector, eventType, value));
    }

    // Error callback

    private errorCallbacks:Array<(block: Block, error: any) => void> = [];

    public registerErrorCallback(callback:(block: Block, error: any) => void): void {
        this.errorCallbacks.push(callback);
    }

    public _emitError(block: Block, error: any) {
        this.errorCallbacks.forEach(callback => callback(block, error));
    }

    // Log callback

    private logCallbacks:Array<(block: Block, type: string, message: any) => void> = [];

    public registerLogCallback(callback:(block: Block, type: string, message: any) => void): void {
        this.logCallbacks.push(callback);
    }

    public _emitLog(block:Block, type:string, message:any) {
        this.logCallbacks.forEach(callback => callback(block, type, message));
    }

    // value setters

//  From homer... controls only external connectors
    public setDigitalValue(targetId: string, groupIds: string[], name: string, value: boolean): void {
        //  TODO optimise, find target by block, not by connectors in it!
        this.blocks.find(block => {
            let found = false;
            let group = false;
            block.getExternalInputConnectors().find(connector => {
                if ((connector.targetId == targetId || (groupIds && groupIds.find(i => { if (i == connector.targetId) { group = true; return true; } return false; }))) && connector.name == name  && connector instanceof ExternalDigitalConnector) {
                    found = true;
                    connector.setValue(value, group ? targetId : undefined);
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
            block.getExternalInputConnectors().find(connector => {
                if ((connector.targetId == targetId || (groupIds && groupIds.find(i => { if (i == connector.targetId) { group = true; return true; } return false; }))) && connector.name == name  && connector instanceof ExternalAnalogConnector) {
                    found = true;
                    connector.setValue(value, group ? targetId : undefined);
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
            block.getExternalInputConnectors().find(connector => {
                if ((connector.targetId == targetId || (groupIds && groupIds.find(i => { if (i == connector.targetId) { group = true; return true; } return false; }))) && connector.name == name && connector instanceof ExternalMessageConnector) {
                    found = true;
                    connector.setValue(message, group ? targetId : undefined);
                    return true;
                }
                return false;
            });
            return found;
        });
    }

//  For remote view controlling
    public setInputConnectorValue(blockId: string, connectorName: string, value: boolean|number|Message): void {
        this.blocks.forEach((block) => {
            if (block.id == blockId) {
                //TODO what about interface connectors rename? ... m_, d_, a_ ??
                let connector:Connector = block.getInputConnectorByName(connectorName);
                if (connector) {
                    connector._inputSetValue(value);
                }
            }
        });
    }

    public setOutputConnectorValue(blockId: string, connectorName: string, value: boolean|number|Message): void {
        this.blocks.forEach((block) => {
            if (block.id == blockId) {
                //TODO what about interface connectors rename? ... m_, d_, a_ ??
                let connector:Connector = block.getOutputConnectorByName(connectorName);
                if (connector) {
                    connector._outputSetValue(value);
                }
            }
        });
    }

    public getDigitalInputNames(): Array<any> {
        let ret:Array<any> = [];
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
        let ret:Array<any> = [];
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
        let ret:Array<any> = [];
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
        let ret:Array<any> = [];
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
        let ret:Array<any> = [];
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
        let ret:Array<any> = [];
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
            if (block.id == blockId) {
                (<TSBlock>block).setError(enabled);
            }
        });
    }

    // interfaces

    public addInterface(iface: BlockoTargetInterface): void {
        if (typeof iface != 'object') {
            console.error('Controller::addInterface - invalid interface');
            return;
        }

        let interfaceId = iface.interfaceId;

        if (!interfaceId) {
            console.error('Controller::addInterface - interfaceId is missing in interface');
            return;
        }

        let id = this.getInterfaceBlockId();

        let inputsBlock: InputsInterfaceBlock = new InputsInterfaceBlock(id + '-IN', iface);
        inputsBlock.x = iface.pos_x;
        inputsBlock.y = iface.pos_y;
        if (iface.grid) {
            inputsBlock.setTargetId(iface.interfaceId);
        }
        this.addBlock(inputsBlock);

        let outputsBlock: OutputsInterfaceBlock = new OutputsInterfaceBlock(id + '-OUT', iface);
        outputsBlock.x = iface.pos_x + 70;
        outputsBlock.y = iface.pos_y;
        if (iface.grid) {
            outputsBlock.setTargetId(iface.interfaceId);
        }
        this.addBlock(outputsBlock);
    }

    private interfaceBoundCallbacks: Array<(iface: BoundInterface) => void> = [];

    public registerInterfaceBoundCallback(callback: (iface: BoundInterface) => void) {
        this.interfaceBoundCallbacks.push(callback);
    }

    /**
     * Binds specific HW or HW group to an hovered interface.
     * This method works only in gui with drag'n'drop.
     * @param {string} targetId of WH
     */
    public bindInterface(targetId: string): void {
        let block = this.blocks.find((b) => {
            return b.renderer && b.renderer.isHover();
        });

        if (block && block instanceof BaseInterfaceBlock && block.interfaceId !== block.targetId) {

            block.setTargetId(targetId);
            block.renderer.refresh();

            let other = block.getOther();
            if (other) {
                other.setTargetId(targetId);
                other.renderer.refresh();
            }

            let interfaceId: string = block.interfaceId;

            this.interfaceBoundCallbacks.forEach(callback => callback({ targetId: targetId, interfaceId: interfaceId }));

        } else {
            console.log('Controller::bindInterface - not found block');
            // TODO throw some error or tell why is not added
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
                targetId: block.targetId
            });
        });

        return bindings;
    }

    // Saving and loading
    public getDataJson(): string {
        let json:any = {
            blocks: {}
        };

        this.blocks.forEach((block:Block) => {
            let blockJson:any = {
                editor: {},
                outputs: {}
            };
            blockJson['type'] = block.type;
            blockJson['visualType'] = block.visualType;

            blockJson['config'] = block.getConfigData();

            blockJson['editor']['x'] = block.x;
            blockJson['editor']['y'] = block.y;

            let outputs:Array<Connector> = block.getOutputConnectors();
            outputs.forEach((connector:Connector) => {
                let connectionsJson:Array<any> = [];

                connector.connections.forEach((connection:Connection) => {
                    let otherConnector:Connector = connection.getOtherConnector(connector);
                    connectionsJson.push({
                        'block': otherConnector.block.id,
                        'connector': otherConnector.name
                    })
                });

                blockJson['outputs'][connector.name] = connectionsJson;
            });

            if (block instanceof InputsInterfaceBlock || block instanceof OutputsInterfaceBlock) {
                blockJson['interface'] = block.interface;
                blockJson['targetId'] = block.targetId;
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
            let json:any = JSON.parse(jsonString);

            //TODO: make it better!

            if (json && json['blocks']) {
                this.removeAllBlocks();

                let blocks:any = json['blocks'];

                // first pass - init blocks
                for (let id in blocks) {
                    if (blocks.hasOwnProperty(id)) {
                        let block:any = blocks[id];

                        let bc:BlockClass = this.getBlockClassByVisualType(block['visualType']);

                        let blockObj:Block = null;
                        if (bc == TSBlock) {
                            blockObj = new TSBlock(id, '', block['designJson']);
                        } else {
                            blockObj = new bc(id);
                        }

                        if (block['interface'] && (blockObj instanceof InputsInterfaceBlock || blockObj instanceof  OutputsInterfaceBlock)) {
                            blockObj.setInterface(block['interface']);
                            if (block['targetId']) {
                                blockObj.setTargetId(block['targetId']);
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
                        let block:any = blocks[id];

                        let b1:Block = this.getBlockById(id);

                        let outputs = block['outputs'];
                        for (let outputName in outputs) {
                            if (outputs.hasOwnProperty(outputName)) {

                                let connections:Array<any> = outputs[outputName];
                                connections.forEach((connParams:any) => {

                                    let b2name = connParams['block'];
                                    let inputName = connParams['connector'];

                                    let c1:Connector = b1.getOutputConnectorByName(outputName);
                                    let b2:Block = this.getBlockById(b2name);
                                    let c2:Connector = b2.getInputConnectorByName(inputName);

                                    c1.connect(c2);
                                });
                            }
                        }
                    }
                }
            }
            //this._emitDataChanged();
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