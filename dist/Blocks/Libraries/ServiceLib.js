"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const machineWrap = (o, machine) => {
    let ret = new Proxy(o, {
        get: function (target, property) {
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
            }
            else {
                out = target[property];
            }
            return out;
        }
    });
    return ret;
};
class ServicesHandler {
    constructor(name) {
        this._name = name;
        this._services = {};
    }
    get libName() {
        return this._name;
    }
    get libTypings() {
        let output = '';
        for (let i in this._services) {
            if (this._services.hasOwnProperty(i)) {
                output += this._services[i].libTypings;
            }
        }
        return output;
    }
    ;
    addService(service) {
        this._services[service.name] = service;
        this._services[service.name].configuration = this._configuration;
    }
    removeService(service) {
        delete this._services[service.name];
    }
    get services() {
        return this._services;
    }
    set configuration(configuration) {
        this._configuration = configuration;
        const allServices = this.services;
        for (let i in allServices) {
            if (allServices.hasOwnProperty(i) && allServices[i]) {
                allServices[i].configuration = this._configuration;
            }
        }
    }
    get configuration() {
        return this._configuration;
    }
}
exports.ServicesHandler = ServicesHandler;
class ServiceLib {
    constructor(handler) {
        this.handler = handler;
    }
    get name() {
        return ServiceLib.libName;
    }
    init() { }
    clean() { }
    external(machine) {
        let newServices = {};
        for (let i in this.handler.services) {
            if (this.handler.services.hasOwnProperty(i)) {
                newServices[i] = machineWrap(this.handler.services[i], machine);
            }
        }
        return {
            services: newServices
        };
    }
}
ServiceLib.libName = "ServiceLib";
ServiceLib.libTypings = `

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
exports.ServiceLib = ServiceLib;
