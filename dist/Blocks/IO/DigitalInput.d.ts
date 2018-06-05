import { Block, DigitalConnector } from '../../Core';
export declare class DigitalInput extends Block {
    connectorOutput: DigitalConnector;
    constructor(id: string, visibleType: string);
}
