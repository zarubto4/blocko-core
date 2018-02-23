import * as Core from '../../Core/index';
import { ConnectorEvent } from '../../Core';
export declare class Not extends Core.Block {
    connectorInput: Core.Connector;
    connectorOutput: Core.Connector;
    constructor(id: string);
    protected afterControllerSet(): void;
    rendererGetBlockBackgroundColor(): string;
    rendererGetDisplayName(): string;
    inputsChanged(): void;
    protected inputChanged(event: ConnectorEvent): void;
}
