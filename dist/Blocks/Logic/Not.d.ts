import * as Core from '../../Core/index';
import { ConnectorEvent } from '../../Core';
import { Message } from '../../Core/Message';
export declare class Not extends Core.Block {
    connectorInput: Core.Connector<boolean | number | Message | Object>;
    connectorOutput: Core.Connector<boolean | number | Message | Object>;
    constructor(id: string);
    protected afterControllerSet(): void;
    rendererGetDisplayName(): string;
    inputsChanged(): void;
    protected inputChanged(event: ConnectorEvent): void;
}
