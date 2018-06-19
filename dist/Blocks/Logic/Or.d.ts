import { Block, ConfigProperty, ConnectorEvent, DigitalConnector } from '../../Core';
export declare class Or extends Block {
    connectorOutput: DigitalConnector;
    protected confInputsCount: ConfigProperty;
    protected confNegate: ConfigProperty;
    constructor(id: string);
    initialize(): void;
    configChanged(): void;
    inputsChanged(): void;
    protected inputChanged(event: ConnectorEvent): void;
}
