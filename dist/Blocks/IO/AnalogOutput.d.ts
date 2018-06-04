import { Block, ConfigProperty, Connector, ConnectorEvent } from '../../Core';
export declare class AnalogOutput extends Block {
    connectorInput: Connector;
    protected analogValue: ConfigProperty;
    constructor(id: string);
    rendererGetDisplayName(): string;
    protected inputChanged(event: ConnectorEvent): void;
}
