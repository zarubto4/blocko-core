import * as Core from '../../Core/index';
export declare class AnalogOutput extends Core.Block {
    connectorInput: Core.Connector;
    constructor(id: string);
    rendererGetBlockBackgroundColor(): string;
    rendererGetDisplayName(): string;
    protected inputChanged(connector: Core.Connector, eventType: Core.ConnectorEventType, value: boolean | number | Core.Message): void;
}
