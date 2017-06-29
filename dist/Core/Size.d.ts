export declare class Size {
    width: number;
    height: number;
    constructor(width?: number, height?: number);
    plus(p: Size): Size;
    minus(p: Size): Size;
    isEqual(p: Size): boolean;
}
