"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BlockRegistration_1 = require("./BlockRegistration");
const ServiceLib_1 = require("../Blocks/Libraries/ServiceLib");
const ExternalConnector_1 = require("./ExternalConnector");
const InterfaceBlock_1 = require("../Blocks/InterfaceBlock");
const Blocks_1 = require("../Blocks");
const Database_1 = require("./Database");
const common_lib_1 = require("common-lib");
const Events_1 = require("./Events");
class Controller extends common_lib_1.Events.Emitter {
    constructor(configuration) {
        super();
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
        this.inputConnectorEventCallbacks = [];
        this.outputConnectorEventCallbacks = [];
        this.externalInputConnectorEventCallbacks = [];
        this.externalOutputConnectorEventCallbacks = [];
        this.errorCallbacks = [];
        this.logCallbacks = [];
        this.blocks = [];
        this.connections = [];
        this.blocksRegister = [];
        this._servicesHandler = new ServiceLib_1.ServicesHandler(this, 'BlockoServiceHandler');
    }
    registerService(service) {
        this._servicesHandler.addService(service);
    }
    get servicesHandler() {
        return this._servicesHandler;
    }
    get database() {
        if (!this._database) {
            this._database = new Database_1.Database(this);
        }
        return this._database;
    }
    registerBlocks(blocksClass) {
        blocksClass.forEach((bc) => {
            this.registerBlock(bc);
        });
    }
    registerBlock(blockClass) {
        let b = new blockClass('register');
        let blockRegistration = new BlockRegistration_1.BlockRegistration(blockClass, b.type, b.name);
        this.blocksRegister.push(blockRegistration);
    }
    getBlockClassByType(type) {
        let blockClass = null;
        this.blocksRegister.forEach((blockRegistration) => {
            if (blockRegistration.type === type) {
                blockClass = blockRegistration.blockClass;
            }
        });
        return blockClass;
    }
    registerBlockAddedCallback(callback) {
        this.blockAddedCallbacks.push(callback);
    }
    addBlock(block) {
        if (!block.id) {
            block.id = this.getFreeBlockId();
        }
        block.registerInputEventCallback((connector, eventType, value) => this.inputConnectorEvent(connector, eventType, value));
        block.registerOutputEventCallback((connector, eventType, value) => this.outputConnectorEvent(connector, eventType, value));
        block.registerExternalInputEventCallback(this.externalInputConnectorEvent.bind(this));
        block.registerExternalOutputEventCallback(this.externalOutputConnectorEvent.bind(this));
        block.controller = this;
        this.blocks.push(block);
        this.blockAddedCallbacks.forEach(callback => callback(block));
        this.emit(null, new Events_1.BlockAddedEvent(block));
        block.initialize();
    }
    registerConnectionAddedCallback(callback) {
        this.connectionAddedCallbacks.push(callback);
    }
    _addConnection(connection) {
        this.connections.push(connection);
        this.emit(this, new Events_1.ConnectionAddedEvent(connection));
        if (connection.getInputConnector().isDigital() || connection.getInputConnector().isAnalog()) {
            connection.getInputConnector()._inputSetValue(connection.getOutputConnector().value);
        }
        this.connectionAddedCallbacks.forEach(callback => callback(connection));
    }
    registerConnectionRemovedCallback(callback) {
        this.connectionRemovedCallbacks.push(callback);
    }
    _removeConnection(connection) {
        let index = this.connections.indexOf(connection);
        if (index > -1) {
            this.connections.splice(index, 1);
            if (connection.getInputConnector().isDigital()) {
                connection.getInputConnector()._inputSetValue(false);
            }
            if (connection.getInputConnector().isAnalog()) {
                connection.getInputConnector()._inputSetValue(0);
            }
            this.emit(this, new Events_1.ConnectionRemovedEvent(connection));
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
            this.emit(this, new Events_1.BlockRemovedEvent(block));
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
            if (b.id === id) {
                block = b;
            }
        });
        return block;
    }
    getFreeBlockId() {
        let id = '';
        do {
            this.blockIndex++;
            id = 'B-' + this.blockIndex;
        } while (this.getBlockById(id) != null);
        return id;
    }
    getInterfaceBlockId() {
        let id = '';
        do {
            this.interfaceIndex++;
            id = 'I-' + this.interfaceIndex;
        } while (this.getBlockById(id + '-IN') != null);
        return id;
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
    externalInputConnectorEvent(block, event) {
        this.externalInputConnectorEventCallbacks.forEach(callback => callback(block, event));
    }
    externalOutputConnectorEvent(block, event) {
        this.externalOutputConnectorEventCallbacks.forEach(callback => callback(block, event));
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
            block.getExternalInputConnectors().find(con => {
                if ((con.targetId === targetId || (groupIds && groupIds.find(i => { if (i === con.targetId) {
                    group = true;
                    return true;
                } return false; }))) && con.name === name && con instanceof ExternalConnector_1.ExternalDigitalConnector) {
                    found = true;
                    con.setValue(value, group ? targetId : undefined);
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
            block.getExternalInputConnectors().find(con => {
                if ((con.targetId === targetId || (groupIds && groupIds.find(i => { if (i === con.targetId) {
                    group = true;
                    return true;
                } return false; }))) && con.name === name && con instanceof ExternalConnector_1.ExternalAnalogConnector) {
                    found = true;
                    con.setValue(value, group ? targetId : undefined);
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
            block.getExternalInputConnectors().find(con => {
                if ((con.targetId === targetId || (groupIds && groupIds.find(i => { if (i === con.targetId) {
                    group = true;
                    return true;
                } return false; }))) && con.name === name && con instanceof ExternalConnector_1.ExternalMessageConnector) {
                    found = true;
                    con.setValue(message, group ? targetId : undefined);
                    return true;
                }
                return false;
            });
            return found;
        });
    }
    setWebHookValue(blockId, message) {
        if (typeof message === 'object' && !Array.isArray(message)) {
            let webHookBlock = this.blocks.find((b) => {
                return b instanceof Blocks_1.WebHook && b.id === blockId;
            });
            if (webHookBlock) {
                webHookBlock.getJsonOutput()._outputSetValue(message);
                return true;
            }
            else {
                console.warn('Controller::setWebHookValue - cannot find any WebHook block with id:', blockId);
            }
        }
        else {
            console.error('Controller::setWebHookValue - attempt to set wrong value on WebHook, object is required, but got \'' + Array.isArray(message) ? 'array' : typeof message + '\'');
        }
        return false;
    }
    setInputConnectorValue(blockId, connectorName, value) {
        this.blocks.forEach((block) => {
            if (block.id === blockId) {
                let connector = block.getInputConnectorById(connectorName);
                if (connector) {
                    connector._inputSetValue(value);
                }
            }
        });
    }
    setOutputConnectorValue(blockId, connectorName, value) {
        this.blocks.forEach((block) => {
            if (block.id === blockId) {
                let connector = block.getOutputConnectorById(connectorName);
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
    getWebHooks() {
        let webHooks = [];
        this.blocks.forEach((b) => {
            if (b instanceof Blocks_1.WebHook) {
                webHooks.push(b.id);
            }
        });
        return webHooks;
    }
    setError(blockId, enabled) {
        this.blocks.forEach(block => {
            if (block.id === blockId) {
                block.setError(enabled);
            }
        });
    }
    addInterface(iface) {
        if (typeof iface !== 'object') {
            console.error('Controller::addInterface - invalid interface');
            return;
        }
        if ((!iface.code && !iface.grid) || (iface.code && iface.grid)) {
            console.error('Controller::addInterface - \'code\' and \'grid\' property are both (un)defined, you must define exactly one of them');
            return;
        }
        let id = this.getInterfaceBlockId();
        this.addBlock(new InterfaceBlock_1.InputsInterfaceBlock(id + '-IN', iface));
        this.addBlock(new InterfaceBlock_1.OutputsInterfaceBlock(id + '-OUT', iface));
    }
    getBindings() {
        let bindings = [];
        this.blocks.filter((block) => {
            return block instanceof Blocks_1.BaseInterfaceBlock && block.isInput() && block.targetId && !block.isGrid();
        }).forEach((block) => {
            bindings.push({
                interfaceId: block.interfaceId,
                targetId: block.targetId,
                group: block.group
            });
        });
        return bindings;
    }
    registerHardwareRestartCallback(callback) {
        this.hardwareRestartCallback = callback;
    }
    callHardwareRestartCallback(targetId) {
        if (this.hardwareRestartCallback) {
            this.hardwareRestartCallback(targetId);
        }
    }
    setHardwareNetworkStatus(targetId, groupIds, online) {
        if (targetId && typeof online === 'boolean') {
            let block = this.blocks.find(b => {
                return b instanceof InterfaceBlock_1.OutputsInterfaceBlock && b.interface.code && (b.targetId === targetId || (groupIds && groupIds.indexOf(b.targetId) !== -1));
            });
            if (block) {
                let connector = block.getNetworkStatusOutput();
                if (connector) {
                    connector._outputSetValue(online, block.group ? targetId : null);
                }
            }
        }
        else {
            console.warn('Controller::setHardwareNetworkStatus - invalid values, got targetId:', targetId, 'and online:', online);
        }
    }
    getDataJson() {
        let data = {
            blocks: {}
        };
        this.blocks.forEach((block) => {
            data['blocks'][block.id] = block.getDataJson();
        });
        return data;
    }
    setDataJson(data) {
        try {
            if (data && data['blocks']) {
                this.removeAllBlocks();
                let blocks = data['blocks'];
                for (let id in blocks) {
                    if (blocks.hasOwnProperty(id)) {
                        let block = blocks[id];
                        let bc = this.getBlockClassByType(block['visualType'] ? block['visualType'] : block['type']);
                        let blockObj = new bc(id);
                        blockObj.setDataJson(block);
                        this.addBlock(blockObj);
                        blockObj.setConfigData(block['config']);
                    }
                }
                for (let id in blocks) {
                    if (blocks.hasOwnProperty(id)) {
                        let block = blocks[id];
                        let b1 = this.getBlockById(id);
                        let outputs = block['outputs'];
                        for (let outputName in outputs) {
                            if (outputs.hasOwnProperty(outputName)) {
                                let connections = outputs[outputName];
                                connections.forEach((connParams) => {
                                    let b2name = connParams['block'];
                                    let inputName = connParams['connector'];
                                    let c1 = b1.getOutputConnectorById(outputName);
                                    let b2 = this.getBlockById(b2name);
                                    let c2 = b2.getInputConnectorById(inputName);
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
        return 'OK';
    }
    isDeployable() {
        let index = this.blocks.findIndex((b) => {
            return b instanceof Blocks_1.BaseInterfaceBlock && !b.targetId;
        });
        return index === -1;
    }
}
exports.Controller = Controller;
