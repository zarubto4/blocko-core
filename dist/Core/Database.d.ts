export declare class DatabaseDao {
    protected _database: Database;
    constructor(secret: string);
    insert(data: Object | Array<Object>): void;
}
export declare class Database {
    protected static _connectionString: string;
    static connectionString: string;
    protected _mongoClient: any;
    protected _mongoDb: any;
    protected _mongoCollection: any;
    protected _queue: Array<Object>;
    constructor(secret: string);
    insert(data: Object | Array<Object>): void;
    isConnected(): boolean;
    protected validateData(data: Object | Array<Object>): void;
    protected doInsert(data: Object | Array<Object>): void;
}
export declare class DatabaseError extends Error {
}
