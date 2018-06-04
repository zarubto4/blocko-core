import * as Core from '../../Core/index';
import { ConnectorEvent } from '../../Core';
export declare class DigitalOutput extends Core.Block {
    connectorInput: Core.Connector;
    constructor(id: string, visibleType: string);
    protected inputChanged(event: ConnectorEvent): void;
}
