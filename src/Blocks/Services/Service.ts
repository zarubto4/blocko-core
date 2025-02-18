/**
 *
 * Base service for ServiceLib
 *
 */
import { ServicesHandler } from '..';


export class Service {
    public static libTypings: string = '';

    public get libTypings(): string {
        return Service.libTypings;
    }

    private _configuration: any;

    protected _handler: ServicesHandler;

    constructor(configuration: any = {}) { this._configuration = configuration; }
    public init() {}
    public clean() {}
    public get name(): string { return null; }
    public get configuration(): any { return this._configuration; }
    public set configuration(configuration: any) { this._configuration = configuration; }
    public set handler(handler: ServicesHandler) { this._handler = handler};
}
