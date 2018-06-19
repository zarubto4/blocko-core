import { AnalogConnector, Block, ConfigProperty, ConnectorEvent } from '../../Core';
export declare class AnalogOutput extends Block {
    connectorInput: AnalogConnector;
    protected analogValue: ConfigProperty;
    constructor(id: string);
    initialize(): void;
    protected inputChanged(event: ConnectorEvent): void;
}
