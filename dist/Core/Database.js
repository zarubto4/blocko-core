"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isNode = require("detect-node");
let MongoDb;
class DatabaseDao {
    constructor(collection) {
        this._queue = [];
        this._collection = collection;
    }
    insert(data) {
        this.validateData(data);
        if (isNode) {
            if (this._collection) {
                let toInsert;
                if (this._queue.length > 0) {
                    toInsert = this._queue.slice();
                    this._queue = [];
                }
                if (toInsert) {
                    if (Array.isArray(data)) {
                        toInsert.concat(data);
                    }
                    else {
                        toInsert.push(data);
                    }
                    this.doInsert(toInsert);
                }
                else {
                    this.doInsert(data);
                }
            }
            else {
                while (this._queue.length > 100) {
                    this._queue.shift();
                }
                if (Array.isArray(data)) {
                    this._queue.concat(data);
                }
                else {
                    this._queue.push(data);
                }
            }
        }
    }
    validateData(data) {
        if (Array.isArray(data)) {
            let invalid = data.find((obj) => {
                return typeof obj !== 'object';
            });
            if (invalid) {
                throw new DatabaseError('Attempting to write invalid data. Data must be object or array of objects.');
            }
        }
        else if (typeof data !== 'object') {
            throw new DatabaseError('Attempting to write invalid data. Data must be object or array of objects.');
        }
    }
    doInsert(data) {
        let callback = (error, result) => {
            if (error) {
                console.error(error);
                throw new DatabaseError('Insert failed.');
            }
            else {
                console.log(result);
            }
        };
        if (Array.isArray(data)) {
            this._collection.insertMany(data, callback);
        }
        else {
            this._collection.insertOne(data, callback);
        }
    }
}
exports.DatabaseDao = DatabaseDao;
class Database {
    constructor(controller) {
        this._clients = {};
        this._controller = controller;
    }
    getClient(connectionString) {
        if (this._clients.hasOwnProperty(connectionString)) {
            return Promise.resolve(this._clients[connectionString]);
        }
        else {
            return mongodb().MongoClient.connect(connectionString, { useNewUrlParser: true })
                .then((client) => {
                this._clients[connectionString] = client;
                return client;
            });
        }
    }
    getDao(connectionString, databaseName, collectionName) {
        if (isNode) {
            return this.getClient(connectionString)
                .then((client) => {
                return new DatabaseDao(client.db(databaseName).collection(collectionName));
            });
        }
        else {
            return Promise.resolve(new DatabaseDao(null));
        }
    }
}
exports.Database = Database;
function mongodb() {
    if (isNode) {
        if (!MongoDb) {
            try {
                MongoDb = require('mongodb');
            }
            catch (e) {
                console.error('require(\'mongodb\') failed. Is mongodb module installed?');
            }
        }
        return MongoDb;
    }
    else {
        throw new DatabaseError('Database cannot be accessed in the browser.');
    }
}
class DatabaseError extends Error {
}
exports.DatabaseError = DatabaseError;
