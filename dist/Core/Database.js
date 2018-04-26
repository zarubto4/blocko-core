"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isNode = require("detect-node");
let MongoDb;
class DatabaseDao {
    constructor(secret) {
        if (isNode) {
            this._database = new Database(secret);
        }
    }
    insert(data) {
        if (isNode) {
            this._database.insert(data);
        }
    }
}
exports.DatabaseDao = DatabaseDao;
class Database {
    constructor(secret) {
        this._queue = [];
        if (isNode) {
            try {
                MongoDb = require('mongodb');
            }
            catch (e) {
                console.error('require(\'mongodb\') failed. Is mongodb module installed?');
            }
        }
        else {
            throw new DatabaseError('Database cannot be accessed in the browser.');
        }
        MongoDb.MongoClient.connect(Database._connectionString, (error, client) => {
            if (error) {
            }
            else {
                this._mongoClient = client;
                this._mongoDb = this._mongoClient.db('byzance-bigdata-00');
                this._mongoCollection = this._mongoDb.collection(secret);
            }
        });
    }
    static set connectionString(value) {
        Database._connectionString = value;
    }
    insert(data) {
        this.validateData(data);
        if (this.isConnected()) {
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
    isConnected() {
        return this._mongoClient && this._mongoClient.isConnected('byzance-bigdata');
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
                throw new DatabaseError('Insert failed.');
            }
        };
        if (Array.isArray(data)) {
            this._mongoCollection.insertMany(data, callback);
        }
        else {
            this._mongoCollection.insertOne(data, callback);
        }
    }
}
exports.Database = Database;
class DatabaseError extends Error {
}
exports.DatabaseError = DatabaseError;
