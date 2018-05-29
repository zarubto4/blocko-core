import { Block, ConfigProperty, Connector } from '../../Core';
import { Message } from '../../Core/Message';
export declare class AnalogInput extends Block {
    connectorOutput: Connector<boolean | number | Message | Object>;
    protected currentValue: number;
    protected analogValue: ConfigProperty;
    constructor(id: string);
    rendererGetBlockBackgroundColor(): string;
    rendererGetDisplayName(): string;
    rendererGetDisplayNameCursor(): string;
    onMouseDrag(e: {
        dx: number;
        dy: number;
    }): boolean;
    configChanged(): void;
}
