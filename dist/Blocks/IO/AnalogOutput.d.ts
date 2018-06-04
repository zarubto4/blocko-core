import { Block, ConfigProperty, Connector, ConnectorEvent } from '../../Core';
import { Message } from '../../Core/Message';
export declare class AnalogOutput extends Block {
    connectorInput: Connector<boolean | number | Message | Object>;
    protected analogValue: ConfigProperty;
    constructor(id: string);
    rendererGetDisplayName(): string;
    protected inputChanged(event: ConnectorEvent): void;
}
