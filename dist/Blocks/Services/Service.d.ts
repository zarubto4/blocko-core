export declare class Service {
    static libTypings: string;
    readonly libTypings: string;
    private _configuration;
    constructor(configuration?: any);
    init(): void;
    clean(): void;
    readonly name: string;
    configuration: any;
}
