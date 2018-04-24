import { Service } from './Service';
import { DatabaseDao } from '../../Core/Database';
export declare class DatabaseService extends Service {
    static serviceName: string;
    static libTypings: string;
    constructor(configuration?: {
        localTime: boolean;
    });
    readonly libTypings: string;
    readonly name: string;
    db(secret: string): DatabaseDao;
}
