export interface BlockClass {
    new (id: string): any;
}
export declare class BlockRegistration {
    blockClass: BlockClass;
    type: string;
    displayName: string;
    constructor(blockClass: BlockClass, type: string, displayName: string);
}
