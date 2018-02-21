"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BlockRegistration_1 = require("./BlockRegistration");
const ServiceLib_1 = require("../Blocks/Libraries/ServiceLib");
const ExternalConnector_1 = require("./ExternalConnector");
const InterfaceBlock_1 = require("../Blocks/InterfaceBlock");
const TSBlock_1 = require("../Blocks/TSBlock/TSBlock");
const Message_1 = require("./Message");
const InterfaceBlockGroup_1 = require("../Blocks/InterfaceBlockGroup");
const Blocks_1 = require("../Blocks");
class Controller {
    constructor() {
        this.safeRun = false;
        this.gui = false;
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
        this.interfaceIndex = 0;
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
        let b = new blockClass("register");
        let blockRegistration = new BlockRegistration_1.BlockRegistration(blockClass, b.type, b.visualType, b.rendererGetDisplayName());
        this.blocksRegister.push(blockRegistration);
    }
    getBlockClassByVisualType(visualType) {
        let blockClass = null;
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
        let index = this.connections.indexOf(connection);
        if (index > -1) {
            this.connections.splice(index, 1);
            this.connectionRemovedCallbacks.forEach(callback => callback(connection));
        }
    }
    registerBlockRemovedCallback(callback) {
        this.blockRemovedCallbacks.push(callback);
    }
    _removeBlock(block) {
        let index = this.blocks.indexOf(block);
        if (index > -1) {
            this.blocks.splice(index, 1);
            this.blockRemovedCallbacks.forEach(callback => callback(block));
        }
    }
    removeAllBlocks() {
        let toDelete = this.blocks.slice(0);
        toDelete.forEach((block) => {
            block.remove();
        });
        this.blockIndex = 0;
        this.interfaceIndex = 0;
    }
    getBlockById(id) {
        let block = null;
        this.blocks.forEach((b) => {
            if (b.id == id) {
                block = b;
            }
        });
        return block;
    }
    getFreeBlockId() {
        let id = "";
        do {
            this.blockIndex++;
            id = "B-" + this.blockIndex;
        } while (this.getBlockById(id) != null);
        return id;
    }
    getInterfaceBlockId() {
        let id = "";
        do {
            this.interfaceIndex++;
            id = "I-" + this.interfaceIndex;
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
    setDigitalValue(targetId, groupIds, name, value) {
        this.blocks.find(block => {
            let found = false;
            let group = false;
            block.getExternalInputConnectors().find(connector => {
                if ((connector.targetId == targetId || (groupIds && groupIds.find(i => { if (i == connector.targetId) {
                    group = true;
                    return true;
                } return false; }))) && connector.name == name) {
                    found = true;
                    if (group && connector instanceof ExternalConnector_1.ExternalMessageConnector) {
                        connector.setValue(new Message_1.Message(['string', 'number'], [targetId, value]));
                    }
                    else if (connector instanceof ExternalConnector_1.ExternalDigitalConnector) {
                        connector.setValue(value);
                    }
                    return true;
                }
                return false;
            });
            return found;
        });
    }
    setAnalogValue(targetId, groupIds, name, value) {
        this.blocks.find(block => {
            let found = false;
            let group = false;
            block.getExternalInputConnectors().find(connector => {
                if ((connector.targetId == targetId || (groupIds && groupIds.find(i => { if (i == connector.targetId) {
                    group = true;
                    return true;
                } return false; }))) && connector.name == name) {
                    found = true;
                    if (group && connector instanceof ExternalConnector_1.ExternalMessageConnector) {
                        connector.setValue(new Message_1.Message(['string', 'number'], [targetId, value]));
                    }
                    else if (connector instanceof ExternalConnector_1.ExternalAnalogConnector) {
                        connector.setValue(value);
                    }
                    return true;
                }
                return false;
            });
            return found;
        });
    }
    setMessageValue(targetId, groupIds, name, message) {
        this.blocks.find(block => {
            let found = false;
            let group = false;
            block.getExternalInputConnectors().find(connector => {
                if ((connector.targetId == targetId || (groupIds && groupIds.find(i => { if (i == connector.targetId) {
                    group = true;
                    return true;
                } return false; }))) && connector.name == name && connector instanceof ExternalConnector_1.ExternalMessageConnector) {
                    found = true;
                    if (group) {
                        let argTypes = Message_1.MessageHelpers.stringArgTypesFromArgTypes(message.argTypes);
                        argTypes.unshift('string');
                        let values = message.values;
                        values.unshift(targetId);
                        connector.setValue(new Message_1.Message(argTypes, values));
                    }
                    else {
                        connector.setValue(message);
                    }
                    return true;
                }
                return false;
            });
            return found;
        });
    }
    setInputConnectorValue(blockId, connectorName, value) {
        this.blocks.forEach((block) => {
            if (block.id == blockId) {
                let connector = block.getInputConnectorByName(connectorName);
                if (connector) {
                    connector._inputSetValue(value);
                }
            }
        });
    }
    setOutputConnectorValue(blockId, connectorName, value) {
        this.blocks.forEach((block) => {
            if (block.id == blockId) {
                let connector = block.getOutputConnectorByName(connectorName);
                if (connector) {
                    connector._outputSetValue(value);
                }
            }
        });
    }
    getDigitalInputNames() {
        let ret = [];
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
        let ret = [];
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
        let ret = [];
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
        let ret = [];
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
        let ret = [];
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
        let ret = [];
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
    addInterface(iface) {
        if (typeof iface != "object") {
            console.error("Controller::addInterface - invalid interface");
            return;
        }
        let interfaceId = iface.interfaceId;
        if (!interfaceId) {
            console.error("Controller::addInterface - interfaceId is missing in interface");
            return;
        }
        let existing = this.blocks.findIndex((block) => {
            return block instanceof Blocks_1.BaseInterfaceBlock && block.interfaceId === interfaceId;
        });
        if (existing > -1) {
            return;
        }
        let id = this.getInterfaceBlockId();
        let inputsBlock = new InterfaceBlock_1.InputsInterfaceBlock(id + "-IN", iface);
        inputsBlock.x = iface.pos_x;
        inputsBlock.y = iface.pos_y;
        this.addBlock(inputsBlock);
        let outputsBlock = new InterfaceBlock_1.OutputsInterfaceBlock(id + "-OUT", iface);
        outputsBlock.x = iface.pos_x + 70;
        outputsBlock.y = iface.pos_y;
        this.addBlock(outputsBlock);
    }
    addInterfaceGroup(iface) {
        if (typeof iface != "object") {
            console.error("Controller::addInterfaceGroup - invalid interface");
            return;
        }
        let interfaceId = iface.interfaceId;
        if (!interfaceId) {
            console.error("Controller::addInterfaceGroup - interfaceId is missing in interface");
            return;
        }
        let existing = this.blocks.findIndex((block) => {
            return block instanceof Blocks_1.BaseInterfaceBlockGroup && block.interfaceId === interfaceId;
        });
        if (existing > -1) {
            return;
        }
        let id = this.getInterfaceBlockId();
        let inputsBlock = new InterfaceBlockGroup_1.InputsInterfaceBlockGroup(id + "-IN", iface);
        inputsBlock.x = iface.pos_x;
        inputsBlock.y = iface.pos_y;
        this.addBlock(inputsBlock);
        let outputsBlock = new InterfaceBlockGroup_1.OutputsInterfaceBlockGroup(id + "-OUT", iface);
        outputsBlock.x = iface.pos_x + 70;
        outputsBlock.y = iface.pos_y;
        this.addBlock(outputsBlock);
    }
    registerInterfaceBoundCallback(callback) {
        this.interfaceBoundCallbacks.push(callback);
    }
    bindInterface(targetId, group) {
        let block = this.blocks.find((b) => {
            return b.renderer && b.renderer.isHover();
        });
        if (block && ((block instanceof Blocks_1.BaseInterfaceBlock && !group) || (block instanceof Blocks_1.BaseInterfaceBlockGroup && group))) {
            block.setTargetId(targetId);
            block.renderer.refresh();
            let other = block.getOther();
            if (other) {
                other.setTargetId(targetId);
                other.renderer.refresh();
            }
            let interfaceId = block.interfaceId;
            this.interfaceBoundCallbacks.forEach(callback => callback({ targetId: targetId, interfaceId: interfaceId }));
        }
        else {
            console.log('Controller::bindInterface - not found block');
        }
    }
    getDataJson() {
        let json = {
            blocks: {}
        };
        this.blocks.forEach((block) => {
            let blockJson = {
                editor: {},
                outputs: {}
            };
            blockJson["type"] = block.type;
            blockJson["visualType"] = block.visualType;
            blockJson["config"] = block.getConfigData();
            blockJson["editor"]["x"] = block.x;
            blockJson["editor"]["y"] = block.y;
            let outputs = block.getOutputConnectors();
            outputs.forEach((connector) => {
                let connectionsJson = [];
                connector.connections.forEach((connection) => {
                    let otherConnector = connection.getOtherConnector(connector);
                    connectionsJson.push({
                        "block": otherConnector.block.id,
                        "connector": otherConnector.name
                    });
                });
                blockJson["outputs"][connector.name] = connectionsJson;
            });
            if (block instanceof InterfaceBlock_1.InputsInterfaceBlock || block instanceof InterfaceBlock_1.OutputsInterfaceBlock || block instanceof InterfaceBlockGroup_1.InputsInterfaceBlockGroup || block instanceof InterfaceBlockGroup_1.OutputsInterfaceBlockGroup) {
                blockJson["interface"] = block.interface;
                blockJson["targetId"] = block.targetId;
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
            let json = JSON.parse(jsonString);
            if (json && json["blocks"]) {
                this.removeAllBlocks();
                let blocks = json["blocks"];
                for (let id in blocks) {
                    if (blocks.hasOwnProperty(id)) {
                        let block = blocks[id];
                        let bc = this.getBlockClassByVisualType(block["visualType"]);
                        let blockObj = null;
                        if (bc == TSBlock_1.TSBlock) {
                            blockObj = new TSBlock_1.TSBlock(id, "", block["designJson"]);
                        }
                        else {
                            blockObj = new bc(id);
                        }
                        if (block["interface"] && (blockObj instanceof InterfaceBlock_1.InputsInterfaceBlock || blockObj instanceof InterfaceBlock_1.OutputsInterfaceBlock || blockObj instanceof InterfaceBlockGroup_1.InputsInterfaceBlockGroup || blockObj instanceof InterfaceBlockGroup_1.OutputsInterfaceBlockGroup)) {
                            blockObj.setInterface(block["interface"]);
                            if (block["targetId"]) {
                                blockObj.setTargetId(block["targetId"]);
                            }
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
                for (let id in blocks) {
                    if (blocks.hasOwnProperty(id)) {
                        let block = blocks[id];
                        let b1 = this.getBlockById(id);
                        let outputs = block["outputs"];
                        for (let outputName in outputs) {
                            if (outputs.hasOwnProperty(outputName)) {
                                let connections = outputs[outputName];
                                connections.forEach((connParams) => {
                                    let b2name = connParams["block"];
                                    let inputName = connParams["connector"];
                                    let c1 = b1.getOutputConnectorByName(outputName);
                                    let b2 = this.getBlockById(b2name);
                                    let c2 = b2.getInputConnectorByName(inputName);
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
    isDeployable() {
        let index = this.blocks.findIndex((b) => {
            return (b instanceof Blocks_1.BaseInterfaceBlock || b instanceof Blocks_1.BaseInterfaceBlockGroup) && !b.targetId;
        });
        return index === -1;
    }
}
exports.Controller = Controller;
