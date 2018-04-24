"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Service_1 = require("./Service");
const Database_1 = require("../../Core/Database");
class DatabaseService extends Service_1.Service {
    constructor(configuration = {}) {
        super(configuration);
    }
    get libTypings() {
        return DatabaseService.libTypings;
    }
    get name() {
        return DatabaseService.serviceName;
    }
    db(secret) {
        return new Database_1.DatabaseDao(this.configuration.insertFunction);
    }
}
DatabaseService.serviceName = "dbService";
DatabaseService.libTypings = `
    declare class DatabaseService {
        
        /**
         * Get database data access object.
         */
        db(secret: string): DatabaseDao;
    }
    

    declare module services {
        const dbService: DatabaseService;
    };
    `;
exports.DatabaseService = DatabaseService;
