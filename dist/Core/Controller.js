"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BlockRegistration_1 = require("./BlockRegistration");
const ServiceLib_1 = require("../Blocks/Libraries/ServiceLib");
const ExternalConnector_1 = require("./ExternalConnector");
const InterfaceBlock_1 = require("../Blocks/InterfaceBlock");
const TSBlock_1 = require("../Blocks/TSBlock/TSBlock");
class Controller {
    constructor() {
        this.safeRun = false;
        this.configuration = {
            inputEnabled: true,
            outputEnabled: true,
            asyncEventsEnabled: true
        };
        this.blockAddedCallbacks = [];
        this.connectionAddedCallbacks = [];
        this.connectionRemovedCallbacks = [];
        this.blockRemovedCallbacks = [];
        this.blockIndex = 0;
        this.factoryBlockRendererCallback = null;
        this.factoryConnectionRendererCallback = null;
        this.inputConnectorEventCallbacks = [];
        this.outputConnectorEventCallbacks = [];
        this.externalInputConnectorEventCallbacks = [];
        this.externalOutputConnectorEventCallbacks = [];
        this.errorCallbacks = [];
        this.logCallbacks = [];
        this.blocks = [];
        this.connections = [];
        this.blocksRegister = [];
        this._servicesHandler = new ServiceLib_1.ServicesHandler("BlockoServiceHandler");
    }
    registerService(service) {
        this._servicesHandler.addService(service);
    }
    get servicesHandler() {
        return this._servicesHandler;
    }
    registerBlocks(blocksClass) {
        blocksClass.forEach((bc) => {
            this.registerBlock(bc);
        });
    }
    registerBlock(blockClass) {
        var b = new blockClass("register");
        var blockRegistration = new BlockRegistration_1.BlockRegistration(blockClass, b.type, b.visualType, b.rendererGetDisplayName());
        this.blocksRegister.push(blockRegistration);
    }
    getBlockClassByVisutalType(visualType) {
        var blockClass = null;
        this.blocksRegister.forEach((blockRegistration) => {
            if (blockRegistration.visualType == visualType) {
                blockClass = blockRegistration.blockClass;
            }
        });
        return blockClass;
    }
    registerBlockAddedCallback(callback) {
        this.blockAddedCallbacks.push(callback);
    }
    addBlock(block) {
        block.registerInputEventCallback((connector, eventType, value) => this.inputConnectorEvent(connector, eventType, value));
        block.registerOutputEventCallback((connector, eventType, value) => this.outputConnectorEvent(connector, eventType, value));
        block.registerExternalInputEventCallback((connector, eventType, value) => this.externalInputConnectorEvent(connector, eventType, value));
        block.registerExternalOutputEventCallback((connector, eventType, value) => this.externalOutputConnectorEvent(connector, eventType, value));
        if (this.factoryBlockRendererCallback) {
            block.renderer = this.factoryBlockRendererCallback(block);
        }
        else if (this.rendererFactory) {
            block.renderer = this.rendererFactory.factoryBlockRenderer(block);
        }
        block.controller = this;
        this.blocks.push(block);
        this.blockAddedCallbacks.forEach(callback => callback(block));
        block.initialize();
    }
    registerConnectionAddedCallback(callback) {
        this.connectionAddedCallbacks.push(callback);
    }
    _addConnection(connection) {
        if (this.factoryConnectionRendererCallback) {
            connection.renderer = this.factoryConnectionRendererCallback(connection);
        }
        else if (this.rendererFactory) {
            connection.renderer = this.rendererFactory.factoryConnectionRenderer(connection);
        }
        this.connections.push(connection);
        this.connectionAddedCallbacks.forEach(callback => callback(connection));
    }
    registerConnectionRemovedCallback(callback) {
        this.connectionRemovedCallbacks.push(callback);
    }
    _removeConnection(connection) {
        var index = this.connections.indexOf(connection);
        if (index > -1) {
            this.connections.splice(index, 1);
            this.connectionRemovedCallbacks.forEach(callback => callback(connection));
        }
    }
    registerBlockRemovedCallback(callback) {
        this.blockRemovedCallbacks.push(callback);
    }
    _removeBlock(block) {
        var index = this.blocks.indexOf(block);
        if (index > -1) {
            this.blocks.splice(index, 1);
            this.blockRemovedCallbacks.forEach(callback => callback(block));
        }
    }
    removeAllBlocks() {
        var toDelete = this.blocks.slice(0);
        toDelete.forEach((block) => {
            block.remove();
        });
        this.blockIndex = 0;
    }
    getBlockById(id) {
        var block = null;
        this.blocks.forEach((b) => {
            if (b.id == id) {
                block = b;
            }
        });
        return block;
    }
    getFreeBlockId() {
        var id = "";
        do {
            this.blockIndex++;
            id = "B-" + this.blockIndex;
        } while (this.getBlockById(id) != null);
        return id;
    }
    registerFactoryBlockRendererCallback(callback) {
        this.factoryBlockRendererCallback = callback;
    }
    registerFactoryConnectionRendererCallback(callback) {
        this.factoryConnectionRendererCallback = callback;
    }
    registerInputConnectorEventCallback(callback) {
        this.inputConnectorEventCallbacks.push(callback);
    }
    registerOutputConnectorEventCallback(callback) {
        this.outputConnectorEventCallbacks.push(callback);
    }
    registerExternalInputConnectorEventCallback(callback) {
        this.externalInputConnectorEventCallbacks.push(callback);
    }
    registerExternalOutputConnectorEventCallback(callback) {
        this.externalOutputConnectorEventCallbacks.push(callback);
    }
    inputConnectorEvent(connector, eventType, value) {
        this.inputConnectorEventCallbacks.forEach(callback => callback(connector.block, connector, eventType, value));
    }
    outputConnectorEvent(connector, eventType, value) {
        this.outputConnectorEventCallbacks.forEach(callback => callback(connector.block, connector, eventType, value));
    }
    externalInputConnectorEvent(connector, eventType, value) {
        this.externalInputConnectorEventCallbacks.forEach(callback => callback(connector.block, connector, eventType, value));
    }
    externalOutputConnectorEvent(connector, eventType, value) {
        this.externalOutputConnectorEventCallbacks.forEach(callback => callback(connector.block, connector, eventType, value));
    }
    registerErrorCallback(callback) {
        this.errorCallbacks.push(callback);
    }
    _emitError(block, error) {
        this.errorCallbacks.forEach(callback => callback(block, error));
    }
    registerLogCallback(callback) {
        this.logCallbacks.push(callback);
    }
    _emitLog(block, type, message) {
        this.logCallbacks.forEach(callback => callback(block, type, message));
    }
    setDigitalValue(targetId, name, value) {
        this.blocks.forEach((block) => {
            block.getExternalInputConnectors().forEach((connector) => {
                if (connector.targetId == targetId && connector.name == name && connector instanceof ExternalConnector_1.ExternalDigitalConnector) {
                    connector.setValue(value);
                }
            });
        });
    }
    setAnalogValue(targetId, name, value) {
        this.blocks.forEach((block) => {
            block.getExternalInputConnectors().forEach((connector) => {
                if (connector.targetId == targetId && connector.name == name && connector instanceof ExternalConnector_1.ExternalAnalogConnector) {
                    connector.setValue(value);
                }
            });
        });
    }
    setMessageValue(targetId, name, message) {
        this.blocks.forEach((block) => {
            block.getExternalInputConnectors().forEach((connector) => {
                if (connector.targetId == targetId && connector.name == name && connector instanceof ExternalConnector_1.ExternalMessageConnector) {
                    connector.setValue(message);
                }
            });
        });
    }
    setInputConnectorValue(blockId, connectorName, value) {
        this.blocks.forEach((block) => {
            if (block.id == blockId) {
                var connector = block.getInputConnectorByName(connectorName);
                if (connector) {
                    connector._inputSetValue(value);
                }
            }
        });
    }
    setOutputConnectorValue(blockId, connectorName, value) {
        this.blocks.forEach((block) => {
            if (block.id == blockId) {
                var connector = block.getOutputConnectorByName(connectorName);
                if (connector) {
                    connector._outputSetValue(value);
                }
            }
        });
    }
    getDigitalInputNames() {
        var ret = [];
        this.blocks.forEach(block => {
            block.getExternalInputConnectors().forEach(connector => {
                if (connector instanceof ExternalConnector_1.ExternalDigitalConnector) {
                    ret.push({
                        targetId: connector.targetId,
                        name: connector.name,
                    });
                }
            });
        });
        return ret;
    }
    getAnalogInputNames() {
        var ret = [];
        this.blocks.forEach(block => {
            block.getExternalInputConnectors().forEach(connector => {
                if (connector instanceof ExternalConnector_1.ExternalAnalogConnector) {
                    ret.push({
                        targetId: connector.targetId,
                        name: connector.name,
                    });
                }
            });
        });
        return ret;
    }
    getMessageInputNames() {
        var ret = [];
        this.blocks.forEach(block => {
            block.getExternalInputConnectors().forEach(connector => {
                if (connector instanceof ExternalConnector_1.ExternalMessageConnector) {
                    ret.push({
                        targetId: connector.targetId,
                        name: connector.name,
                    });
                }
            });
        });
        return ret;
    }
    getDigitalOutputNames() {
        var ret = [];
        this.blocks.forEach(block => {
            block.getExternalOutputConnectors().forEach(connector => {
                if (connector instanceof ExternalConnector_1.ExternalDigitalConnector) {
                    ret.push({
                        targetId: connector.targetId,
                        name: connector.name,
                    });
                }
            });
        });
        return ret;
    }
    getAnalogOutputNames() {
        var ret = [];
        this.blocks.forEach(block => {
            block.getExternalOutputConnectors().forEach(connector => {
                if (connector instanceof ExternalConnector_1.ExternalAnalogConnector) {
                    ret.push({
                        targetId: connector.targetId,
                        name: connector.name,
                    });
                }
            });
        });
        return ret;
    }
    getMessageOutputNames() {
        var ret = [];
        this.blocks.forEach(block => {
            block.getExternalOutputConnectors().forEach(connector => {
                if (connector instanceof ExternalConnector_1.ExternalMessageConnector) {
                    ret.push({
                        targetId: connector.targetId,
                        name: connector.name,
                    });
                }
            });
        });
        return ret;
    }
    setError(blockId, enabled) {
        this.blocks.forEach(block => {
            if (block.id == blockId) {
                block.setError(enabled);
            }
        });
    }
    setInterfaces(interfaces) {
        if (!Array.isArray(interfaces)) {
            console.log("interfaces is not array");
            return;
        }
        var toDelete = [];
        this.blocks.forEach((block) => {
            if ((block instanceof InterfaceBlock_1.InputsInterfaceBlock) || (block instanceof InterfaceBlock_1.OutputsInterfaceBlock)) {
                toDelete.push(block);
            }
        });
        var posY = 50;
        interfaces.forEach((targetInterface) => {
            if (typeof targetInterface != "object") {
                console.log("wrong targetInterface in interfaces");
                return;
            }
            var targetId = targetInterface.targetId;
            if (!targetId) {
                console.log("wrong targetId in interfaces");
                return;
            }
            var inputsBlock = null;
            var outputsBlock = null;
            toDelete.forEach((block) => {
                if (block instanceof InterfaceBlock_1.InputsInterfaceBlock) {
                    var b = block;
                    if (b.targetId == targetId) {
                        inputsBlock = b;
                    }
                }
                if (block instanceof InterfaceBlock_1.OutputsInterfaceBlock) {
                    var b = block;
                    if (b.targetId == targetId) {
                        outputsBlock = b;
                    }
                }
            });
            if (!inputsBlock) {
                inputsBlock = new InterfaceBlock_1.InputsInterfaceBlock(targetId + "_inputs", targetInterface);
                inputsBlock.x = 50;
                inputsBlock.y = posY;
                this.addBlock(inputsBlock);
            }
            else {
                toDelete.splice(toDelete.indexOf(inputsBlock), 1);
                inputsBlock.setInterface(targetInterface);
            }
            if (!outputsBlock) {
                outputsBlock = new InterfaceBlock_1.OutputsInterfaceBlock(targetId + "_outputs", targetInterface);
                outputsBlock.x = 120;
                outputsBlock.y = posY;
                this.addBlock(outputsBlock);
            }
            else {
                toDelete.splice(toDelete.indexOf(outputsBlock), 1);
                outputsBlock.setInterface(targetInterface);
            }
            posY += 200;
        });
        toDelete.forEach((block) => {
            block.remove();
        });
    }
    getDataJson() {
        var json = {};
        json["blocks"] = {};
        this.blocks.forEach((block) => {
            var blockJson = {};
            blockJson["type"] = block.type;
            blockJson["visualType"] = block.visualType;
            blockJson["config"] = block.getConfigData();
            blockJson["editor"] = {};
            blockJson["editor"]["x"] = block.x;
            blockJson["editor"]["y"] = block.y;
            blockJson["outputs"] = {};
            var outputs = block.getOutputConnectors();
            outputs.forEach((connector) => {
                var connectionsJson = [];
                connector.connections.forEach((connection) => {
                    var otherConnector = connection.getOtherConnector(connector);
                    connectionsJson.push({
                        "block": otherConnector.block.id,
                        "connector": otherConnector.name
                    });
                });
                blockJson["outputs"][connector.name] = connectionsJson;
            });
            if ((block instanceof InterfaceBlock_1.InputsInterfaceBlock) || (block instanceof InterfaceBlock_1.OutputsInterfaceBlock)) {
                blockJson["interface"] = block.interface;
            }
            if (block instanceof TSBlock_1.TSBlock) {
                blockJson["code"] = block.code;
                blockJson["designJson"] = block.designJson;
            }
            json["blocks"][block.id] = blockJson;
        });
        return JSON.stringify(json);
    }
    setDataJson(jsonString) {
        try {
            var json = JSON.parse(jsonString);
            if (json && json["blocks"]) {
                this.removeAllBlocks();
                var blocks = json["blocks"];
                for (var id in blocks) {
                    if (blocks.hasOwnProperty(id)) {
                        var block = blocks[id];
                        var bc = this.getBlockClassByVisutalType(block["visualType"]);
                        var blockObj = null;
                        if (bc == TSBlock_1.TSBlock) {
                            blockObj = new TSBlock_1.TSBlock(id, "", block["designJson"]);
                        }
                        else {
                            blockObj = new bc(id);
                        }
                        if ((block["interface"]) && ((blockObj instanceof InterfaceBlock_1.InputsInterfaceBlock) || (blockObj instanceof InterfaceBlock_1.OutputsInterfaceBlock))) {
                            blockObj.setInterface(block["interface"]);
                        }
                        blockObj.x = block["editor"]["x"];
                        blockObj.y = block["editor"]["y"];
                        this.addBlock(blockObj);
                        if (blockObj instanceof TSBlock_1.TSBlock) {
                            blockObj.setCode(block["code"]);
                        }
                        blockObj.setConfigData(block["config"]);
                    }
                }
                for (var id in blocks) {
                    if (blocks.hasOwnProperty(id)) {
                        var block = blocks[id];
                        var b1 = this.getBlockById(id);
                        var outputs = block["outputs"];
                        for (var outputName in outputs) {
                            if (outputs.hasOwnProperty(outputName)) {
                                var connections = outputs[outputName];
                                connections.forEach((connParams) => {
                                    var b2name = connParams["block"];
                                    var inputName = connParams["connector"];
                                    var c1 = b1.getOutputConnectorByName(outputName);
                                    var b2 = this.getBlockById(b2name);
                                    var c2 = b2.getInputConnectorByName(inputName);
                                    c1.connect(c2);
                                });
                            }
                        }
                    }
                }
            }
        }
        catch (error) {
            this.removeAllBlocks();
            return error;
        }
        return "OK";
    }
}
exports.Controller = Controller;
