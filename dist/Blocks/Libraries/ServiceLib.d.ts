import { Library, Machine } from 'script-engine';
import { Service } from '../Services/Service';
export declare class ServicesHandler {
    private _name;
    protected _services: {
        [key: string]: Service;
    };
    protected _configuration: any;
    constructor(name: string);
    readonly libName: string;
    readonly libTypings: string;
    addService(service: Service): void;
    removeService(service: Service): void;
    readonly services: {
        [key: string]: Service;
    };
    configuration: any;
}
export declare class ServiceLib implements Library {
    static libName: string;
    static libTypings: string;
    protected handler: ServicesHandler;
    constructor(handler: ServicesHandler);
    readonly name: string;
    init(): void;
    clean(): void;
    external(machine: Machine): {
        [p: string]: any;
    };
}
