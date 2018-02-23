import * as Core from '../../Core/index';
import { ConnectorEvent } from '../../Core';
export declare class AnalogOutput extends Core.Block {
    connectorInput: Core.Connector;
    constructor(id: string);
    rendererGetBlockBackgroundColor(): string;
    rendererGetDisplayName(): string;
    protected inputChanged(event: ConnectorEvent): void;
}
