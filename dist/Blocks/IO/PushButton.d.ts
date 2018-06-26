import { DigitalInput } from './DigitalInput';
import { ConfigProperty } from '../../Core';
export declare class PushButton extends DigitalInput {
    protected buttonValue: ConfigProperty;
    constructor(id: string);
    initialize(): void;
    configChanged(): void;
}
