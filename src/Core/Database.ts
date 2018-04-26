import * as isNode from 'detect-node';

let MongoDb;

export class DatabaseDao {

    protected _database: Database;

    constructor(secret: string) {
        if (isNode) {
            this._database = new Database(secret);
        }
    }

    public insert(data: Object | Array<Object>) {
        if (isNode) {
            this._database.insert(data);
        }
    }
}

export class Database {

    protected static _connectionString: string;

    public static set connectionString(value: string) {
        Database._connectionString = value;
    }

    protected _mongoClient;
    protected _mongoDb;
    protected _mongoCollection;

    protected _queue: Array<Object> = [];

    constructor(secret: string) {

        if (isNode) {
            try {
                MongoDb = require('mongodb')
            } catch (e) {
                console.error('require(\'mongodb\') failed. Is mongodb module installed?')
            }
        } else {
            throw new DatabaseError('Database cannot be accessed in the browser.')
        }

        MongoDb.MongoClient.connect(Database._connectionString, (error, client) => {
            if (error) {
                // TODO something
            } else {
                this._mongoClient = client;
                this._mongoDb = this._mongoClient.db('byzance-bigdata-00'); // TODO some config
                this._mongoCollection = this._mongoDb.collection(secret);
            }
        });
    }

    /**
     *
     * @param {Object | Array<Object>} data
     */
    public insert(data: Object | Array<Object>): void {

        // Throws error if data is invalid
        this.validateData(data);

        if (this.isConnected()) {

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

    public isConnected(): boolean {
        return this._mongoClient && this._mongoClient.isConnected('byzance-bigdata');
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
            this._mongoCollection.insertMany(data, callback);
        } else {
            this._mongoCollection.insertOne(data, callback);
        }
    }
}

export class DatabaseError extends Error {

}
