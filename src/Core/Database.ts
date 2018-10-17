import * as isNode from 'detect-node';
import { Controller } from './Controller';

let MongoDb;

export class DatabaseDao {

    protected _collection;

    protected _queue: Array<Object> = [];

    constructor(collection) {
        this._collection = collection;
    }

    /**
     * @param {Object | Array<Object>} data
     */
    public insert(data: Object | Array<Object>): void {

        // Throws error if data is invalid
        this.validateData(data);

        if (isNode) {
            if (this._collection) {

                let toInsert: Array<Object>;

                if (this._queue.length > 0) {
                    toInsert = this._queue.slice();
                    this._queue = [];
                }

                if (toInsert) {

                    if (Array.isArray(data)) {
                        toInsert.concat(data);
                    } else {
                        toInsert.push(data);
                    }

                    this.doInsert(toInsert);
                } else {
                    this.doInsert(data);
                }

            } else {

                while (this._queue.length > 100) {
                    this._queue.shift();
                    // TODO somehow let know that data is not saved
                }

                if (Array.isArray(data)) {
                    this._queue.concat(data);
                } else {
                    this._queue.push(data);
                }
                // throw new DatabaseError('The database is currently unavailable.');
            }
        }
    }

    protected validateData(data: Object|Array<Object>): void {
        if (Array.isArray(data)) {
            let invalid: Object = data.find((obj) => {
                return typeof obj !== 'object';
            });

            if (invalid) {
                throw new DatabaseError('Attempting to write invalid data. Data must be object or array of objects.');
            }
        } else if (typeof data !== 'object') {
            throw new DatabaseError('Attempting to write invalid data. Data must be object or array of objects.');
        }
    }

    protected doInsert(data: Object | Array<Object>): void {

        let callback: (error, result) => void = (error, result) => {
            if (error) {
                throw new DatabaseError('Insert failed.');
            }
        };

        if (Array.isArray(data)) {
            this._collection.insertMany(data, callback);
        } else {
            this._collection.insertOne(data, callback);
        }
    }
}

export class Database {

    protected _controller: Controller;

    protected _clients: { [key: string]: any} = {};

    constructor(controller: Controller) {
        this._controller = controller;
    }

    public getClient(connectionString: string): Promise<any> {
        if (this._clients.hasOwnProperty(connectionString)) {
            return Promise.resolve(this._clients[connectionString]);
        } else {
            return mongodb().MongoClient.connect(connectionString, { useNewUrlParser: true })
                .then((client) => {
                    this._clients[connectionString] = client;
                    return client;
                });
        }
    }

    public getDao(connectionString: string, databaseName: string, collectionName: string): Promise<DatabaseDao> {
        if (isNode) {
            return this.getClient(connectionString)
                .then((client) => {
                    return new DatabaseDao(client.db(databaseName).collection(collectionName));
                });
        } else {
            return Promise.resolve(new DatabaseDao(null));
        }
    }
}

function mongodb() {
    if (isNode) {
        if (!MongoDb) {
            try {
                MongoDb = require('mongodb')
            } catch (e) {
                console.error('require(\'mongodb\') failed. Is mongodb module installed?')
            }
        }
        return MongoDb;
    } else {
        throw new DatabaseError('Database cannot be accessed in the browser.');
    }
}

export class DatabaseError extends Error {

}
