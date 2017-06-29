import * as Core from '../../Core/index';
export declare class Xor extends Core.Block {
    connectorOutput: Core.Connector;
    protected confInputsCount: Core.ConfigProperty;
    protected confNegate: Core.ConfigProperty;
    constructor(id: string);
    protected afterControllerSet(): void;
    rendererGetBlockBackgroundColor(): string;
    rendererGetDisplayName(): string;
    configChanged(): void;
    inputsChanged(): void;
    protected inputChanged(connector: Core.Connector, eventType: Core.ConnectorEventType, value: boolean | number | Core.Message): void;
}
