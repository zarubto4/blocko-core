import { Service } from './Service';
export declare class CronService extends Service {
    static serviceName: string;
    static libTypings: string;
    constructor(configuration?: {
        localTime: boolean;
    });
    readonly libTypings: string;
    readonly name: string;
    schedule(cron: string, job: () => void): any;
}
