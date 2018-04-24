import { Service } from './Service';
import { DatabaseDao } from '../../Core/Database';

export class DatabaseService extends Service {
    public static serviceName:string = "dbService";
    public static libTypings:string = `
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

    public constructor(configuration: {localTime: boolean} = <any>{}) {
        super(configuration);
    }

    public get libTypings(): string {
        return DatabaseService.libTypings;
    }

    public get name(): string {
        return DatabaseService.serviceName
    }

    public db(secret: string): DatabaseDao {
        return new DatabaseDao(this.configuration.insertFunction);
    }
}