import { ServicesHandler } from '..';
export declare class Service {
    static libTypings: string;
    readonly libTypings: string;
    private _configuration;
    protected _handler: ServicesHandler;
    constructor(configuration?: any);
    init(): void;
    clean(): void;
    readonly name: string;
    configuration: any;
    handler: ServicesHandler;
}
