import * as scheduler from 'later';

export class CronScheduler {

    public static schedule(cron: string, job: () => void): any {
        let schedule = scheduler.parse.cron(cron, true);
        return scheduler.setInterval(job, schedule);
    }
}
