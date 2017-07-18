import { Block } from "./Block";
import { Message } from "./Message";
import { Types } from "common-lib";
export declare enum ExternalConnectorType {
    Input = 0,
    Output = 1,
}
export declare class ExternalConnector<T extends boolean | number | Message> {
    block: Block;
    type: ExternalConnectorType;
    protected value: T;
    private _targetId;
    private _name;
    constructor(block: Block, targetId: string, name: string, type: ExternalConnectorType);
    getValue(): T;
    setValue(value: T): void;
    name: string;
    readonly targetId: string;
}
export declare class ExternalDigitalConnector extends ExternalConnector<boolean> {
    constructor(block: Block, targetId: string, name: string, type: ExternalConnectorType);
}
export declare class ExternalAnalogConnector extends ExternalConnector<number> {
    constructor(block: Block, targetId: string, name: string, type: ExternalConnectorType);
}
export declare class ExternalMessageConnector extends ExternalConnector<Message> {
    private _argTypes;
    constructor(block: Block, targetId: string, name: string, type: ExternalConnectorType, argTypes: Types.Type[]);
    readonly argTypes: Types.Type[];
    isArgTypesEqual(argTypes: Types.Type[]): boolean;
    setValue(value: Message): void;
}
