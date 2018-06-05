import { Block, ConfigProperty, ConnectorEvent, DigitalConnector } from '../../Core';
export declare class Xor extends Block {
    connectorOutput: DigitalConnector;
    protected confInputsCount: ConfigProperty;
    protected confNegate: ConfigProperty;
    constructor(id: string);
    protected afterControllerSet(): void;
    rendererGetDisplayName(): string;
    configChanged(): void;
    inputsChanged(): void;
    protected inputChanged(event: ConnectorEvent): void;
}
