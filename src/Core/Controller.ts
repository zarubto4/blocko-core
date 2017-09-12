

import {IBlockRenderer, Block} from "./Block";
import {Connection, IConnectionRenderer} from "./Connection";
import {BlockClass, BlockRegistration} from "./BlockRegistration";
import {Connector, ConnectorEventType} from "./Connector";
import {ServicesHandler} from "../Blocks/Libraries/ServiceLib";
import {Service} from "../Blocks/Services/Service";
import {
    ExternalAnalogConnector, ExternalDigitalConnector, ExternalConnectorType,
    ExternalConnector, ExternalMessageConnector
} from "./ExternalConnector";
import {
    InputsInterfaceBlock,
    OutputsInterfaceBlock, BlockoTargetInterface
} from "../Blocks/InterfaceBlock";
import {TSBlock} from "../Blocks/TSBlock/TSBlock";
import {Message} from "./Message";
import {Types} from "common-lib";


export interface IRendererFactory {
    factoryBlockRenderer(block:Block):IBlockRenderer;
    factoryConnectionRenderer(connection:Connection):IConnectionRenderer;
}

export interface BlockoInstanceConfig {
    inputEnabled:boolean;
    outputEnabled:boolean;
    asyncEventsEnabled:boolean;
}

export class Controller {

    blocksRegister:Array<BlockRegistration>;

    // Blocks storage
    blocks:Array<Block>;
    connections:Array<Connection>;

    public rendererFactory:IRendererFactory;

    public safeRun:boolean = false;

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
        this._servicesHandler = new ServicesHandler("BlockoServiceHandler");
    }

    public registerService(service: Service) {
        this._servicesHandler.addService(service);
    }

    public get servicesHandler(): ServicesHandler {
        return this._servicesHandler;
    }

    public registerBlocks(blocksClass:Array<BlockClass>):void {
        blocksClass.forEach((bc:BlockClass) => {
            this.registerBlock(bc);
        });
    }

    public registerBlock(blockClass:BlockClass):void {
        var b:Block = new blockClass("register");
        var blockRegistration:BlockRegistration = new BlockRegistration(blockClass, b.type, b.visualType, b.rendererGetDisplayName());
        this.blocksRegister.push(blockRegistration);
    }

    public getBlockClassByVisutalType(visualType:string):BlockClass {
        var blockClass:BlockClass = null;
        this.blocksRegister.forEach((blockRegistration:BlockRegistration) => {
            if (blockRegistration.visualType == visualType) {
                blockClass = blockRegistration.blockClass;
            }
        });
        return blockClass;
    }

    private blockAddedCallbacks:Array<(block:Block) => void> = [];

    public registerBlockAddedCallback(callback:(block:Block) => void):void {
        this.blockAddedCallbacks.push(callback);
    }

    public addBlock(block:Block) {

        block.registerInputEventCallback((connector:Connector, eventType:ConnectorEventType, value:boolean|number|Message) => this.inputConnectorEvent(connector, eventType, value));
        block.registerOutputEventCallback((connector:Connector, eventType:ConnectorEventType, value:boolean|number|Message) => this.outputConnectorEvent(connector, eventType, value));

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

    private connectionAddedCallbacks:Array<(connection:Connection) => void> = [];

    public registerConnectionAddedCallback(callback:(connection:Connection) => void):void {
        this.connectionAddedCallbacks.push(callback);
    }

    public _addConnection(connection:Connection) {
        if (this.factoryConnectionRendererCallback) {
            connection.renderer = this.factoryConnectionRendererCallback(connection);
        } else if (this.rendererFactory) {
            connection.renderer = this.rendererFactory.factoryConnectionRenderer(connection);
        }

        this.connections.push(connection);
        this.connectionAddedCallbacks.forEach(callback => callback(connection));

        //this._emitDataChanged();
    }

    private connectionRemovedCallbacks:Array<(connection:Connection) => void> = [];

    public registerConnectionRemovedCallback(callback:(connection:Connection) => void):void {
        this.connectionRemovedCallbacks.push(callback);
    }

    public _removeConnection(connection:Connection) {
        var index = this.connections.indexOf(connection);
        if (index > -1) {
            this.connections.splice(index, 1);
            this.connectionRemovedCallbacks.forEach(callback => callback(connection));
        }

        //this._emitDataChanged();
    }

    private blockRemovedCallbacks:Array<(block:Block) => void> = [];

    public registerBlockRemovedCallback(callback:(block:Block) => void):void {
        this.blockRemovedCallbacks.push(callback);
    }

    public _removeBlock(block:Block) {
        var index = this.blocks.indexOf(block);
        if (index > -1) {
            this.blocks.splice(index, 1);
            this.blockRemovedCallbacks.forEach(callback => callback(block));
        }

        //this._emitDataChanged();
    }

    public removeAllBlocks():void {
        var toDelete:Array<Block> = this.blocks.slice(0);

        toDelete.forEach((block:Block) => {
            block.remove();
        });

        this.blockIndex = 0; // reset block index

        //this._emitDataChanged();
    }

    public getBlockById(id:string):Block {
        var block:Block = null;
        this.blocks.forEach((b:Block) => {
            if (b.id == id) {
                block = b;
            }
        });
        return block;
    }


    private blockIndex = 0;

    public getFreeBlockId():string {
        var id:string = "";
        do {
            this.blockIndex++;
            id = "B-" + this.blockIndex;
        } while (this.getBlockById(id) != null);
        return id;
    }

    private factoryBlockRendererCallback:(block:Block) => IBlockRenderer = null;

    public registerFactoryBlockRendererCallback(callback:(block:Block) => IBlockRenderer):void {
        this.factoryBlockRendererCallback = callback;
    }

    private factoryConnectionRendererCallback:(connection:Connection) => IConnectionRenderer = null;

    public registerFactoryConnectionRendererCallback(callback:(connection:Connection) => IConnectionRenderer):void {
        this.factoryConnectionRendererCallback = callback;
    }

    // Internal connectors

    private inputConnectorEventCallbacks:Array<(block:Block, connector:Connector, eventType:ConnectorEventType, value:boolean|number|Message) => void> = [];

    public registerInputConnectorEventCallback(callback:(block:Block, connector:Connector, eventType:ConnectorEventType, value:boolean|number|Message) => void):void {
        this.inputConnectorEventCallbacks.push(callback);
    }

    private outputConnectorEventCallbacks:Array<(block:Block, connector:Connector, eventType:ConnectorEventType, value:boolean|number|Message) => void> = [];

    public registerOutputConnectorEventCallback(callback:(block:Block, connector:Connector, eventType:ConnectorEventType, value:boolean|number|Message) => void):void {
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

    private inputConnectorEvent(connector:Connector, eventType:ConnectorEventType, value:boolean|number|Message):void {
        this.inputConnectorEventCallbacks.forEach(callback => callback(connector.block, connector, eventType, value));
    }

    private outputConnectorEvent(connector:Connector, eventType:ConnectorEventType, value:boolean|number|Message):void {
        this.outputConnectorEventCallbacks.forEach(callback => callback(connector.block, connector, eventType, value));
    }

    private externalInputConnectorEvent(connector:ExternalAnalogConnector|ExternalDigitalConnector|ExternalMessageConnector, eventType:ConnectorEventType, value:boolean|number|Message):void {
        this.externalInputConnectorEventCallbacks.forEach(callback => callback(connector.block, connector, eventType, value));
    }

    private externalOutputConnectorEvent(connector:ExternalAnalogConnector|ExternalDigitalConnector|ExternalMessageConnector, eventType:ConnectorEventType, value:boolean|number|Message):void {
        this.externalOutputConnectorEventCallbacks.forEach(callback => callback(connector.block, connector, eventType, value));
    }

    // Error callback

    private errorCallbacks:Array<(block:Block, error:any) => void> = [];

    public registerErrorCallback(callback:(block:Block, error:any) => void):void {
        this.errorCallbacks.push(callback);
    }

    public _emitError(block:Block, error:any) {
        this.errorCallbacks.forEach(callback => callback(block, error));
    }

    // Log callback

    private logCallbacks:Array<(block:Block, type:string, message:any) => void> = [];

    public registerLogCallback(callback:(block:Block, type:string, message:any) => void):void {
        this.logCallbacks.push(callback);
    }

    public _emitLog(block:Block, type:string, message:any) {
        this.logCallbacks.forEach(callback => callback(block, type, message));
    }

    // value setters

//  From homer... controlls only external connectors
    public setDigitalValue(targetId:string, name:string, connectorName: string, value:boolean):void {
        //  TODO optimise, find target by block, not by connectors in it!
        this.blocks.forEach((block) => {
            block.getExternalInputConnectors().forEach((connector) => {
                if (connector.targetId == targetId && connector.name == name && connector instanceof ExternalDigitalConnector) {
                    connector.setValue(value);
                }
            });
        });
    }

    public setAnalogValue(targetId:string, name:string, connectorName: string, value:number):void {
        this.blocks.forEach((block) => {
            block.getExternalInputConnectors().forEach((connector) => {
                if (connector.targetId == targetId && connector.name == name && connector instanceof ExternalAnalogConnector) {
                    connector.setValue(value);
                }
            });
        });
    }

    public setMessageValue(targetId:string, name:string, connectorName: string, message:Message):void {
        this.blocks.forEach((block) => {
            block.getExternalInputConnectors().forEach((connector) => {
                if (connector.targetId == targetId && connector.name == name && connector instanceof ExternalMessageConnector) {
                    connector.setValue(message);
                }
            });
        });
    }

//  For remote view controlling
    public setInputConnectorValue(blockId:string, connectorName:string, value:number):void {
        this.blocks.forEach((block) => {
            if (block.id == blockId) {
                //TODO what about interface connectors rename? ... m_, d_, a_ ??
                var connector:Connector = block.getInputConnectorByName(connectorName);
                if (connector) {
                    connector._inputSetValue(value);
                }
            }
        });
    }

    public setOutputConnectorValue(blockId:string, connectorName:string, value:number):void {
        this.blocks.forEach((block) => {
            if (block.id == blockId) {
                //TODO what about interface connectors rename? ... m_, d_, a_ ??
                var connector:Connector = block.getOutputConnectorByName(connectorName);
                if (connector) {
                    connector._outputSetValue(value);
                }
            }
        });
    }

/*Deprecated????
    public setInputExternalConnectorValue(targetType:string, targetId:string, name:string, value:boolean):void {
        this.blocks.forEach((block) => {
            block.getExternalInputConnectors().forEach((connector) => {
                if (connector.targetType == targetType && connector.targetId == targetId && connector.name == name) {
                    connector.setValue(value);
                }
            });
        });
    }

    public setOutputExternalConnectorValue(targetType:string, targetId:string, name:string, value:number):void {
        this.blocks.forEach((block) => {
            block.getExternalOutputConnectors().forEach((connector) => {
                if (connector.targetType == targetType && connector.targetId == targetId && connector.name == name) {
                    connector.setValue(value);
                }
            });
        });
    }
*/
    public getDigitalInputNames():Array<any> {
        var ret:Array<any> = [];
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

    public getAnalogInputNames():Array<any> {
        var ret:Array<any> = [];
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

    public getMessageInputNames():Array<any> {
        var ret:Array<any> = [];
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

    public getDigitalOutputNames():Array<string> {
        var ret:Array<any> = [];
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

    public getAnalogOutputNames():Array<string> {
        var ret:Array<any> = [];
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

    public getMessageOutputNames():Array<string> {
        var ret:Array<any> = [];
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

    public setInterfaces(interfaces:BlockoTargetInterface[]):void {
        
        if (!Array.isArray(interfaces)) {
            console.log("interfaces is not array");
            return;
        }

        var toDelete = [];

        this.blocks.forEach((block:Block) => {
            if ((block instanceof InputsInterfaceBlock) || (block instanceof OutputsInterfaceBlock)) {
                toDelete.push(block);
            }
        });

        var posY = 50;
        
        interfaces.forEach((targetInterface:any) => {
            if (typeof targetInterface != "object") {
                console.log("wrong targetInterface in interfaces");
                return;
            }

            var targetId = targetInterface.targetId;
            
            if (!targetId) {
                console.log("wrong targetId in interfaces");
                return;
            }

            var inputsBlock:InputsInterfaceBlock = null;
            var outputsBlock:OutputsInterfaceBlock = null;

            toDelete.forEach((block:Block) => {
                if (block instanceof InputsInterfaceBlock) {
                    var b:InputsInterfaceBlock = block;
                    if (b.targetId == targetId) {
                        inputsBlock = b;
                    }
                }
                if (block instanceof OutputsInterfaceBlock) {
                    var b:OutputsInterfaceBlock = block;
                    if (b.targetId == targetId) {
                        outputsBlock = b;
                    }
                }
            });

            if (!inputsBlock) {
                inputsBlock = new InputsInterfaceBlock(targetId + "_inputs", targetInterface);
                inputsBlock.x = 50;
                inputsBlock.y = posY;
                this.addBlock(inputsBlock);
            } else {
                toDelete.splice(toDelete.indexOf(inputsBlock), 1);
                inputsBlock.setInterface(targetInterface);
            }

            if (!outputsBlock) {
                outputsBlock = new OutputsInterfaceBlock(targetId + "_outputs", targetInterface);
                outputsBlock.x = 120;
                outputsBlock.y = posY;
                this.addBlock(outputsBlock);
            } else {
                toDelete.splice(toDelete.indexOf(outputsBlock), 1);
                outputsBlock.setInterface(targetInterface);
            }

            posY += 200;
            
        });

        toDelete.forEach((block:Block) => {
            block.remove();
        });
    }

    // Saving and loading

    public getDataJson():string {
        var json:any = {};
        json["blocks"] = {};

        this.blocks.forEach((block:Block) => {
            var blockJson:any = {};
            blockJson["type"] = block.type;
            blockJson["visualType"] = block.visualType;

            blockJson["config"] = block.getConfigData();

            blockJson["editor"] = {};
            blockJson["editor"]["x"] = block.x;
            blockJson["editor"]["y"] = block.y;


            blockJson["outputs"] = {};
            var outputs:Array<Connector> = block.getOutputConnectors();
            outputs.forEach((connector:Connector) => {
                var connectionsJson:Array<any> = [];

                connector.connections.forEach((connection:Connection) => {
                    var otherConnector:Connector = connection.getOtherConnector(connector);
                    connectionsJson.push({
                        "block": otherConnector.block.id,
                        "connector": otherConnector.name
                    })
                });

                blockJson["outputs"][connector.name] = connectionsJson;
            });

            if ((block instanceof InputsInterfaceBlock) || (block instanceof  OutputsInterfaceBlock)) {
                blockJson["interface"] = block.interface;
            }

            if (block instanceof TSBlock) {
                blockJson["code"] = block.code;
                blockJson["designJson"] = block.designJson;
            }

            json["blocks"][block.id] = blockJson;
        });

        return JSON.stringify(json);
    }

    public setDataJson(jsonString:string):string {

        try {
            // Begin of load
            var json:any = JSON.parse(jsonString);

            //TODO: make it better!

            if (json && json["blocks"]) {
                this.removeAllBlocks();

                var blocks:any = json["blocks"];

                // first pass - init blocks
                for (var id in blocks) {
                    if (blocks.hasOwnProperty(id)) {
                        var block:any = blocks[id];

                        var bc:BlockClass = this.getBlockClassByVisutalType(block["visualType"]);

                        var blockObj:Block = null;
                        if (bc == TSBlock) {
                            blockObj = new TSBlock(id, "", block["designJson"]);
                        } else {
                            blockObj = new bc(id);
                        }

                        if ((block["interface"]) && ((blockObj instanceof InputsInterfaceBlock) || (blockObj instanceof  OutputsInterfaceBlock))) {
                            blockObj.setInterface(block["interface"]);
                        }

                        blockObj.x = block["editor"]["x"];
                        blockObj.y = block["editor"]["y"];

                        this.addBlock(blockObj);

                        if (blockObj instanceof TSBlock) {
                            blockObj.setCode(block["code"]);
                        }
                        blockObj.setConfigData(block["config"]);
                    }
                }

                // second pass - connecting
                for (var id in blocks) {
                    if (blocks.hasOwnProperty(id)) {
                        var block:any = blocks[id];

                        var b1:Block = this.getBlockById(id);

                        var outputs = block["outputs"];
                        for (var outputName in outputs) {
                            if (outputs.hasOwnProperty(outputName)) {

                                var connections:Array<any> = outputs[outputName];
                                connections.forEach((connParams:any) => {

                                    var b2name = connParams["block"];
                                    var inputName = connParams["connector"];


                                    var c1:Connector = b1.getOutputConnectorByName(outputName);
                                    var b2:Block = this.getBlockById(b2name);
                                    var c2:Connector = b2.getInputConnectorByName(inputName);

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

        return "OK";

    }
}