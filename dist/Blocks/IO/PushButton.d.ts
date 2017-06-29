import { DigitalInput } from "./DigitalInput";
export declare class PushButton extends DigitalInput {
    constructor(id: string);
    rendererGetDisplayName(): string;
    rendererGetDisplayNameCursor(): string;
    onMouseDown(): void;
    onMouseUp(): void;
    onMouseDrag(event: {
        dx: number;
        dy: number;
    }): boolean;
}
