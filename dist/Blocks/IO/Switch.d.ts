import { DigitalInput } from "./DigitalInput";
export declare class Switch extends DigitalInput {
    constructor(id: string);
    rendererGetDisplayName(): string;
    rendererGetDisplayNameCursor(): string;
    onMouseClick(): void;
    onMouseDrag(event: {
        dx: number;
        dy: number;
    }): boolean;
}
