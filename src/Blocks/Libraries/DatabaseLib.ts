import { Library, Machine } from 'script-engine';
import { DatabaseDao, DatabaseError } from '../../Core/Database';

export class DatabaseLib implements Library {

    public static libName: string = "DatabaseLib";
    public static libTypings: string = `
        declare class DatabaseDao {
            insert(data: Object | Array<Object>): void;
        }

        declare class DatabaseError extends Error {
            message:string;
            type: string;
        }
    `;

    constructor() {
    }

    get name():string {
        return DatabaseLib.libName;
    }

    public init() {}
    public clean() {}

    public external(machine: Machine): {[p: string]: any} {
        return {
            'DatabaseDao': DatabaseDao,
            'DatabaseError': DatabaseError
        };
    }
}