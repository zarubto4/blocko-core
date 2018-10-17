"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Service_1 = require("./Service");
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
    db(connectionString, databaseName, collectionName) {
        return this._handler.controller.database.getDao(connectionString, databaseName, collectionName);
    }
}
DatabaseService.serviceName = 'dbService';
DatabaseService.libTypings = `

        declare class DatabaseService {

            /**
             * Get database data access object.
             */
            db(connectionString: string, databaseName: string, collectionName: string): Promise<DatabaseDao>;
        }


        declare module services {
            const dbService: DatabaseService;
        };
`;
exports.DatabaseService = DatabaseService;
