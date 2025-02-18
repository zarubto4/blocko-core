import { Library, Machine } from 'script-engine';
import { Events } from 'common-lib';
import { TSBlock } from '../TSBlock/TSBlock';
import { Message } from '../../Core/Message';
import { Connector, ConnectorEvent } from '../../Core/Connector';
import { ConfigProperty } from '../../Core/ConfigProperty';
export interface MessageValue {
    types: Array<string>;
    values: Array<boolean | number | string>;
}
export declare class ValueChangedEvent extends Events.Event {
    readonly value: boolean | number;
    readonly interfaceId: string;
    constructor(value: boolean | number, interfaceId?: string);
}
export declare class ConfigValueChangedEvent extends Events.Event {
    readonly value: any;
    constructor(value: any);
}
export declare class MessageReceivedEvent extends Events.Event {
    readonly message: MessageValue | object;
    readonly interfaceId: string;
    constructor(message: MessageValue | object, interfaceId?: string);
}
export declare class GroupInputEvent extends Events.Event {
    readonly value: boolean | number | object | MessageValue;
    readonly interfaceId: string;
    constructor(value: boolean | number | object | MessageValue, interfaceId: string);
}
export declare class ReadyEvent extends Events.Event {
    constructor();
}
export declare class DestroyEvent extends Events.Event {
    constructor();
}
export declare abstract class BaseConnector<T> extends Events.Emitter<ValueChangedEvent | MessageReceivedEvent | GroupInputEvent> {
    protected connector: Connector<boolean | number | object | Message>;
    protected tsBlockLib: TSBlockLib;
    constructor(connector: Connector<boolean | number | object | Message>, tsBlockLib: TSBlockLib);
    readonly name: string;
    readonly displayName: string;
    readonly type: string;
    readonly direction: string;
    readonly lastMessage: MessageValue | object;
    readonly messageTypes: string[];
}
export declare class InputConnector extends BaseConnector<boolean | number | MessageValue> {
    readonly value: boolean | number;
}
export declare class OutputConnector extends BaseConnector<boolean | number | MessageValue> {
    value: boolean | number;
    send(message: Array<boolean | number | string> | object): void;
    groupOutput(value: boolean | number | object | Array<boolean | number | string>, interfaceId: string): void;
}
export declare class ConfigPropertyWrapper extends Events.Emitter<ConfigValueChangedEvent> {
    protected configProperty: ConfigProperty;
    protected tsBlockLib: TSBlockLib;
    constructor(configProperty: ConfigProperty, tsBlockLib: TSBlockLib);
    readonly value: any;
    readonly name: string;
    readonly displayName: string;
    readonly type: string;
}
export declare class TSBlockLib implements Library {
    private tsBlock;
    static libName: string;
    static libTypings: string;
    protected usedInputOutputNames: string[];
    protected inputConnectors: {
        [name: string]: InputConnector;
    };
    protected outputConnectors: {
        [name: string]: OutputConnector;
    };
    protected configPropertiesConnectors: {
        [name: string]: ConfigPropertyWrapper;
    };
    protected inputConnectorsEmitter: Events.Emitter<ValueChangedEvent | MessageReceivedEvent>;
    protected outputConnectorsEmitter: Events.Emitter<ValueChangedEvent | MessageReceivedEvent>;
    protected configPropertiesConnectorsEmitter: Events.Emitter<ConfigValueChangedEvent>;
    protected contextEmitter: Events.Emitter<ReadyEvent | DestroyEvent>;
    protected machine: Machine;
    constructor(tsBlock: TSBlock);
    readonly name: string;
    init(): any;
    clean(): void;
    private nameValidator(name, method);
    private argTypesValidator(argTypes, method);
    private getInputOutputType(type, direction, method);
    private getConfigPropertyType(type, method);
    sendValueToOutputConnector(connector: Connector<boolean | number | object | Message>, value: boolean | number | object | Array<boolean | number | string>, interfaceId?: string): void;
    inputEvent(event: ConnectorEvent): void;
    configChanged(): void;
    callReady(): void;
    callDestroy(): void;
    external(machine: Machine): {
        [p: string]: any;
    };
}
