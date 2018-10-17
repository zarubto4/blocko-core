"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Core_1 = require("../../Core");
const common_lib_1 = require("common-lib");
const Types_1 = require("common-lib/build/Types");
class DatabaseBlock extends Core_1.Block {
    constructor() {
        super(null, 'databaseBlock');
        this.name = 'databaseBlock';
        this.description = 'Block for accessing Mongo Database.';
    }
    initialize() {
        this.input = this.addInputConnector('input', common_lib_1.Types.ConnectorType.JsonInput, 'JSON Input');
        this.connectionString = this.addConfigProperty(Types_1.ConfigPropertyType.String, 'connectionString', 'Connection String', 'changeme');
        this.databaseName = this.addConfigProperty(Types_1.ConfigPropertyType.String, 'databaseName', 'Database Name', 'changeme');
        this.collectionName = this.addConfigProperty(Types_1.ConfigPropertyType.String, 'collectionName', 'Collection Name', 'changeme');
    }
    inputChanged(event) {
        if (this.dao) {
            this.dao.insert(event.value);
        }
        else {
        }
    }
    configChanged() {
        if (this.connectionString.value !== 'changeme' && this.databaseName.value !== 'changeme' && this.collectionName.value !== 'changeme') {
            this._controller.database.getDao(this.connectionString.value, this.databaseName.value, this.collectionName.value)
                .then((dao) => {
                this.dao = dao;
            })
                .catch((error) => {
                console.error(error);
            });
        }
    }
}
exports.DatabaseBlock = DatabaseBlock;
