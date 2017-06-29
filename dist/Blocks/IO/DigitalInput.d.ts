import * as Core from '../../Core/index';
export declare class DigitalInput extends Core.Block {
    connectorOutput: Core.Connector;
    constructor(id: string, visibleType: string);
    rendererGetBlockBackgroundColor(): string;
}
