import * as Core from '../../Core/index';
export declare class DigitalOutput extends Core.Block {
    connectorInput: Core.Connector;
    constructor(id: string, visibleType: string);
    rendererGetDisplayNameCursor(): string;
    rendererGetBlockBackgroundColor(): string;
    protected inputChanged(connector: Core.Connector, eventType: Core.ConnectorEventType, value: boolean | number | Core.Message): void;
}
