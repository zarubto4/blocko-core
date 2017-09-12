
import { Library, Machine } from 'script-engine';
import { Service } from '../Services/Service';

declare const Proxy:any;

const machineWrap = (o:Object, machine:Machine) => {
    let ret = new Proxy(o, {

        //  getter modify output. It wrap output object (if output is object) to proxy
        get: function(target:any, property:string) {
            let descriptor = Object.getOwnPropertyDescriptor(target, property);

            if (!descriptor) {
                let p = target.__proto__;
                while (!descriptor && p) {
                    descriptor = Object.getOwnPropertyDescriptor(p, property);
                    p = p.__proto__;
                }
            }

            if (property === "_machine_") {
                return machine;
            }

            let out;
            if (descriptor && descriptor.get) {
                out = descriptor.get.apply(target, []);
            } else {
                out = target[property];
            }
            return out;
        }
    });

    return ret;
}

export class ServicesHandler {
    private _name: string;
    protected _services: {[key: string]: Service};
    protected _configuration: any;

    constructor(name: string) {
        this._name = name;
        this._services = {};
    }

    public get libName():string {
        return this._name;
    }

    public get libTypings(): string {
        let output = '';

        for(let i in this._services) {
            if (this._services.hasOwnProperty(i)) {
                output += this._services[i].libTypings;
            }
        }

        return output;
    };

    public addService(service: Service) {
        this._services[service.name] = service;
        this._services[service.name].configuration = this._configuration;
    }

    public removeService(service: Service) {
        delete this._services[service.name];
    }

    public get services(): {[key: string]: Service} {
        return this._services;
    }

    public set configuration(configuration: any) {
        this._configuration = configuration;
        const allServices = this.services;
        for(let i in allServices) {
            if (allServices.hasOwnProperty(i) && allServices[i]) {
                allServices[i].configuration = this._configuration;
            }
        }
    }

    public get configuration(): any {
        return this._configuration;
    }
}

export class ServiceLib implements Library {
    public static libName:string = "ServiceLib";
    public static libTypings:string = `

        declare interface Promise<T> {
            /**
             * Attaches callbacks for the resolution of the Promise.
             */
            then<PromiseResult>(fnc:(value: T) => PromiseResult): Promise<PromiseResult>;

            /**
             * Attaches a callback for only the rejection of the Promise.
             */
            catch<PromiseResult>(fnc:(e: Error) => PromiseResult): Promise<PromiseResult>
        }

        declare interface Service {};
        declare module services: {};
    `;

    protected handler: ServicesHandler;

    constructor(handler: ServicesHandler) {
        this.handler = handler;
    }

    get name():string {
        return ServiceLib.libName;
    }

    public init() {}
    public clean() {}

    public external(machine: Machine): {[p: string]: any} {
        let newServices = {};

        for(let i in this.handler.services) {
            if (this.handler.services.hasOwnProperty(i)) {
                newServices[i] = machineWrap(this.handler.services[i], machine);
            }
        }

        return {
            services: newServices
        };
    }
}