import { DigitalConnector } from '../../Core/Connector';
import { Block, ConfigProperty } from '../../Core';
export declare class And extends Block {
    connectorOutput: DigitalConnector;
    protected confInputsCount: ConfigProperty;
    protected confNegate: ConfigProperty;
    constructor(id: string);
    initialize(): void;
    configChanged(): void;
    inputsChanged(): void;
    protected inputChanged(event: any): void;
}
