
export interface BlockClass {
    new (id: string);
}

export class BlockRegistration {
    public blockClass: BlockClass;
    public type: string;
    public displayName: string;

    constructor(blockClass: BlockClass, type: string, displayName: string) {
        this.blockClass = blockClass;
        this.type = type;
        this.displayName = displayName;
    }
}
