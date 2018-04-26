"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Database_1 = require("../../Core/Database");
class DatabaseLib {
    constructor() {
    }
    get name() {
        return DatabaseLib.libName;
    }
    init() { }
    clean() { }
    external(machine) {
        return {
            'DatabaseDao': Database_1.DatabaseDao,
            'DatabaseError': Database_1.DatabaseError
        };
    }
}
DatabaseLib.libName = "DatabaseLib";
DatabaseLib.libTypings = `
        declare class DatabaseDao {
            insert(data: Object | Array<Object>): void;
        }

        declare class DatabaseError extends Error {
            message:string;
            type: string;
        }
    `;
exports.DatabaseLib = DatabaseLib;
