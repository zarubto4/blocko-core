import * as Core from '../../Core/index';
import { ConnectorEvent } from '../../Core';
import { Message } from '../../Core/Message';
export declare class DigitalOutput extends Core.Block {
    connectorInput: Core.Connector<boolean | number | Message | Object>;
    constructor(id: string, visibleType: string);
    rendererGetDisplayNameCursor(): string;
    rendererGetBlockBackgroundColor(): string;
    protected inputChanged(event: ConnectorEvent): void;
}
