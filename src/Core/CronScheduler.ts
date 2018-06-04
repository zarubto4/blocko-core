import * as scheduler from 'later';

export class CronScheduler {

    public static schedule(cron: string, job: <T>() => T): any {
        let schedule = scheduler.parse.cron(cron, true);
        return scheduler.setInterval(job, schedule);
    }
}
