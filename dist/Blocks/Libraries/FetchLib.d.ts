import { Library, Machine } from 'script-engine';
export declare class FetchLib implements Library {
    static libName: string;
    static libTypings: string;
    constructor();
    readonly name: string;
    init(): void;
    clean(): void;
    external(machine: Machine): {
        [p: string]: any;
    };
}
