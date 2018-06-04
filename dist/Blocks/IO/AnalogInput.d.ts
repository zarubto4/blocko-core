import { Block, ConfigProperty, Connector } from '../../Core';
export declare class AnalogInput extends Block {
    connectorOutput: Connector;
    protected currentValue: number;
    protected analogValue: ConfigProperty;
    constructor(id: string);
    rendererGetDisplayName(): string;
    onMouseDrag(e: {
        dx: number;
        dy: number;
    }): boolean;
    configChanged(): void;
}
