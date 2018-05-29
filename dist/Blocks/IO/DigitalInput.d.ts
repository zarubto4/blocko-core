import * as Core from '../../Core/index';
import { Message } from '../../Core/Message';
export declare class DigitalInput extends Core.Block {
    connectorOutput: Core.Connector<boolean | number | Message | Object>;
    constructor(id: string, visibleType: string);
    rendererGetBlockBackgroundColor(): string;
}
