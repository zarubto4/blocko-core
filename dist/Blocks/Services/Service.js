"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Service {
    constructor(configuration = {}) { this._configuration = configuration; }
    get libTypings() {
        return Service.libTypings;
    }
    init() { }
    clean() { }
    get name() { return null; }
    get configuration() { return this._configuration; }
    set configuration(configuration) { this._configuration = configuration; }
    set handler(handler) { this._handler = handler; }
    ;
}
Service.libTypings = '';
exports.Service = Service;
