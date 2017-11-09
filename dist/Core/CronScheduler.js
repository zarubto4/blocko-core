"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scheduler = require("later");
class CronScheduler {
    static schedule(cron, job) {
        let schedule = scheduler.parse.cron(cron, true);
        return scheduler.setInterval(job, schedule);
    }
}
exports.CronScheduler = CronScheduler;
