import { Controller } from './Controller';
export declare class DatabaseDao {
    protected _collection: any;
    protected _queue: Array<Object>;
    constructor(collection: any);
    insert(data: Object | Array<Object>): void;
    protected validateData(data: Object | Array<Object>): void;
    protected doInsert(data: Object | Array<Object>): void;
}
export declare class Database {
    protected _controller: Controller;
    protected _clients: {
        [key: string]: any;
    };
    constructor(controller: Controller);
    getClient(connectionString: string): Promise<any>;
    getDao(connectionString: string, databaseName: string, collectionName: string): Promise<DatabaseDao>;
}
export declare class DatabaseError extends Error {
}
