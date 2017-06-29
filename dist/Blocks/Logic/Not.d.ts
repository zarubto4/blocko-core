import * as Core from '../../Core/index';
export declare class Not extends Core.Block {
    connectorInput: Core.Connector;
    connectorOutput: Core.Connector;
    constructor(id: string);
    protected afterControllerSet(): void;
    rendererGetBlockBackgroundColor(): string;
    rendererGetDisplayName(): string;
    inputsChanged(): void;
    protected inputChanged(connector: Core.Connector, eventType: Core.ConnectorEventType, value: boolean | number | Core.Message): void;
}
