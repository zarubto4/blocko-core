import * as Core from '../../Core/index';
import { ConnectorEvent } from '../../Core';
import { Message } from '../../Core/Message';
export declare class Or extends Core.Block {
    connectorOutput: Core.Connector<boolean | number | Message | Object>;
    protected confInputsCount: Core.ConfigProperty;
    protected confNegate: Core.ConfigProperty;
    constructor(id: string);
    protected afterControllerSet(): void;
    rendererGetBlockBackgroundColor(): string;
    rendererGetDisplayName(): string;
    configChanged(): void;
    inputsChanged(): void;
    protected inputChanged(event: ConnectorEvent): void;
}
