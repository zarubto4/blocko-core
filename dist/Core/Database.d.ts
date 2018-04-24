import { Collection, Db, MongoClient } from 'mongodb';
export declare class DatabaseDao {
    protected _database: Database;
    constructor(secret: string);
    insert(data: Object | Array<Object>): void;
}
export declare class Database {
    protected static _connectionString: string;
    static connectionString: string;
    protected _mongoClient: MongoClient;
    protected _mongoDb: Db;
    protected _mongoCollection: Collection;
    constructor(secret: string);
    insert(data: Object | Array<Object>): void;
    isConnected(): boolean;
}
export declare class DatabaseError extends Error {
}
