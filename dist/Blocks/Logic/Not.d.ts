import * as Core from '../../Core/index';
import { DigitalConnector, ConnectorEvent } from '../../Core/Connector';
export declare class Not extends Core.Block {
    connectorInput: DigitalConnector;
    connectorOutput: DigitalConnector;
    constructor(id: string);
    protected afterControllerSet(): void;
    rendererGetDisplayName(): string;
    inputsChanged(): void;
    protected inputChanged(event: ConnectorEvent): void;
}
