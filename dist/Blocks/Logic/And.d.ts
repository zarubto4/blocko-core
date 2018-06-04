import * as Core from '../../Core/index';
import { Message } from '../../Core/Message';
export declare class And extends Core.Block {
    connectorOutput: Core.Connector<boolean | number | Message | Object>;
    protected confInputsCount: Core.ConfigProperty;
    protected confNegate: Core.ConfigProperty;
    constructor(id: string);
    protected afterControllerSet(): void;
    rendererGetDisplayName(): string;
    configChanged(): void;
    inputsChanged(): void;
    protected inputChanged(event: any): void;
}
