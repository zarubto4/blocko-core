// import { Collection, Db, InsertOneWriteOpResult, InsertWriteOpResult, MongoClient, MongoError } from '@types/mongodb';

import * as isNode from 'detect-node';


let MongoDb;

if (isNode) {

    import('mongodb')
        .then((mongodb) => {
            MongoDb = mongodb;
        })
        .catch((error) => {
            console.error(error);
        });
}

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

    constructor(secret: string) {
        if (!isNode) {
            throw new DatabaseError('Database cannot be accessed in the browser.')
        }

        MongoDb.MongoClient.connect(Database._connectionString, (error, client) => {
            if (error) {
                // TODO something
            } else {
                this._mongoClient = client;
                this._mongoDb = this._mongoClient.db('byzance-bigdata-00');
                this._mongoCollection = this._mongoDb.collection(secret);
            }
        });
    }

    /**
     *
     * @param {Object | Array<Object>} data
     */
    public insert(data: Object | Array<Object>): void {
        if (this.isConnected()) {
            let callback: (error, result) => void = (error, result) => {
                if (error) {
                    throw new DatabaseError('Insert failed.');
                }
            };

            if (Array.isArray(data)) {
                this._mongoCollection.insertMany(data, callback);
            } else if (typeof data === 'object') {
                this._mongoCollection.insertOne(data, callback);
            } else {
                throw new DatabaseError('Attempting to write invalid data. Data must be object or array of objects.');
            }

        } else {
            throw new DatabaseError('The database is currently unavailable.');
        }
    }

    public isConnected(): boolean {
        return this._mongoClient && this._mongoClient.isConnected('byzance-bigdata');
    }

}

export class DatabaseError extends Error {

}
