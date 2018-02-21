
export interface BlockClass {
    new (id: string);
}

export class BlockRegistration {
    public blockClass: BlockClass;
    public type: string;
    public visualType: string;
    public displayName: string;

    constructor(blockClass: BlockClass, type: string, visualType: string, displayName: string) {
        this.blockClass = blockClass;
        this.type = type;
        this.visualType = visualType;
        this.displayName = displayName;
    }
}