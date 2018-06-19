import { AnalogConnector, Block, ConfigProperty } from '../../Core';
export declare class AnalogInput extends Block {
    connectorOutput: AnalogConnector;
    protected currentValue: number;
    protected analogValue: ConfigProperty;
    constructor(id: string);
    initialize(): void;
    configChanged(): void;
}
