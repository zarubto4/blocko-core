import { Block, ConnectorEvent, DigitalConnector } from '../../Core';
export declare class DigitalOutput extends Block {
    connectorInput: DigitalConnector;
    constructor(id: string, visibleType: string);
    protected inputChanged(event: ConnectorEvent): void;
}
