import { Library, Machine } from 'script-engine';
import { Service } from '../Services/Service';
import { Controller } from '../../Core';
export declare class ServicesHandler {
    private _name;
    protected _services: {
        [key: string]: Service;
    };
    protected _configuration: any;
    protected _controller: Controller;
    constructor(controller: Controller, name: string);
    readonly libName: string;
    readonly libTypings: string;
    addService(service: Service): void;
    removeService(service: Service): void;
    readonly services: {
        [key: string]: Service;
    };
    configuration: any;
    readonly controller: Controller;
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
