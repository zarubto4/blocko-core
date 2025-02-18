import { Service } from './Service';
import { CronScheduler } from '../../Core/CronScheduler'

/**
 *
 * Base fetch service
 *
 */
export class CronService extends Service {
    public static serviceName: string = 'cronService';
    public static libTypings: string = `
    declare class CronService {
        /**
         * Schedule job, provide valid Cron expression.
         */
        schedule(cron: string, job: () => void): CronRef;
    }

    declare interface CronRef {
        /**
         * Clears the timer. Should be called on context destroy event to cleanup the timer.
         */
        clear(): void;
    }

    declare module services {
        const cronService: CronService;
    };
    `;

    public constructor(configuration: {localTime: boolean} = <any>{}) {
        super(configuration);
    }

    public get libTypings(): string {
        return CronService.libTypings;
    }

    public get name(): string {
        return CronService.serviceName
    }

    public schedule(cron: string, job: () => void): any {
        return CronScheduler.schedule(cron, job);
    }
}
