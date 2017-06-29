import * as Core from '../../Core/index';
export declare class AnalogInput extends Core.Block {
    connectorOutput: Core.Connector;
    protected currentValue: number;
    constructor(id: string);
    rendererGetBlockBackgroundColor(): string;
    rendererGetDisplayName(): string;
    rendererGetDisplayNameCursor(): string;
    onMouseDrag(event: {
        dx: number;
        dy: number;
    }): boolean;
}
