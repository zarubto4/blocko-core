/**
 * Created by David Uhlíř on 10.04.17.
 */

/*
 *
 * Base service for ServiceLib
 * 
 */
export class Service {
    public static libTypings:string = '';

    public get libTypings(): string {
        return Service.libTypings;
    }

    private _configuration: any;

    constructor(configuration: any = {}) {this._configuration = configuration;}
    public init() {}
    public clean() {}
    public get name(): string {return null;}
    public get configuration(): any {return this._configuration;}
    public set configuration(configuration: any) {this._configuration = configuration;}
}