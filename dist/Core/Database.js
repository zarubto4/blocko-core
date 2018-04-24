"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
class DatabaseDao {
    constructor(secret) {
        this._database = new Database(secret);
    }
    insert(data) {
        this._database.insert(data);
    }
}
exports.DatabaseDao = DatabaseDao;
class Database {
    static set connectionString(value) {
        Database._connectionString = value;
    }
    constructor(secret) {
        mongodb_1.MongoClient.connect(Database._connectionString, (error, client) => {
            if (error) {
            }
            else {
                this._mongoClient = client;
                this._mongoDb = this._mongoClient.db('byzance-bigdata-00');
                this._mongoCollection = this._mongoDb.collection(secret);
            }
        });
    }
    insert(data) {
        if (this.isConnected()) {
            let callback = (error, result) => {
                if (error) {
                    throw new DatabaseError('Insert failed.');
                }
            };
            if (Array.isArray(data)) {
                this._mongoCollection.insertMany(data, callback);
            }
            else if (typeof data === 'object') {
                this._mongoCollection.insertOne(data, callback);
            }
            else {
                throw new DatabaseError('Attempting to write invalid data. Data must be object or array of objects.');
            }
        }
        else {
            throw new DatabaseError('The database is currently unavailable.');
        }
    }
    isConnected() {
        return this._mongoClient && this._mongoClient.isConnected('byzance-bigdata');
    }
}
exports.Database = Database;
class DatabaseError extends Error {
}
exports.DatabaseError = DatabaseError;
