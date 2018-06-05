"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Service_1 = require("./Service");
const CronScheduler_1 = require("../../Core/CronScheduler");
class CronService extends Service_1.Service {
    constructor(configuration = {}) {
        super(configuration);
    }
    get libTypings() {
        return CronService.libTypings;
    }
    get name() {
        return CronService.serviceName;
    }
    schedule(cron, job) {
        return CronScheduler_1.CronScheduler.schedule(cron, job);
    }
}
CronService.serviceName = 'cronService';
CronService.libTypings = `
    declare class CronService {
        /**
         * Schedule job, provide valid Cron expression.
         */
        schedule(cron: string, job: <T>() => T): any;
    }

    declare module services {
        const cronService: CronService;
    };
    `;
exports.CronService = CronService;
