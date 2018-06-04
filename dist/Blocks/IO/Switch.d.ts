import { DigitalInput } from './DigitalInput';
import { ConfigProperty } from '../../Core';
export declare class Switch extends DigitalInput {
    protected switchValue: ConfigProperty;
    constructor(id: string);
    rendererGetDisplayName(): string;
    onMouseClick(): void;
    onMouseDrag(event: {
        dx: number;
        dy: number;
    }): boolean;
    configChanged(): void;
}
