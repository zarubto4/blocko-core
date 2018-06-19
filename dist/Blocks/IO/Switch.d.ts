import { DigitalInput } from './DigitalInput';
import { ConfigProperty } from '../../Core';
export declare class Switch extends DigitalInput {
    protected switchValue: ConfigProperty;
    constructor(id: string);
    initialize(): void;
    configChanged(): void;
}
