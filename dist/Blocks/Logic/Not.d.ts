import * as Core from '../../Core/index';
import { DigitalConnector, ConnectorEvent } from '../../Core/Connector';
export declare class Not extends Core.Block {
    connectorInput: DigitalConnector;
    connectorOutput: DigitalConnector;
    constructor(id: string);
    initialize(): void;
    inputsChanged(): void;
    protected inputChanged(event: ConnectorEvent): void;
}
