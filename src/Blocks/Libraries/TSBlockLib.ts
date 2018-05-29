

import { Library, Machine } from 'script-engine';
import { Types, Events, Libs } from 'common-lib';
import { TSBlockError } from '../TSBlock/TSBlockError';
import { TSBlock } from '../TSBlock/TSBlock';
import { Message } from '../../Core/Message';
import { Connector, ConnectorEventType, ConnectorEvent } from '../../Core/Connector';
import { ConfigProperty } from '../../Core/ConfigProperty';

export interface MessageValue {
    types: Array<string>,
    values: Array<boolean|number|string>
}

export class ValueChangedEvent extends Events.Event {
    constructor(public readonly value: boolean|number) {
        super('valueChanged');
    };
}

export class ConfigValueChangedEvent extends Events.Event {
    constructor(public readonly value: any) {
        super('valueChanged');
    };
}

export class MessageReceivedEvent extends Events.Event {
    constructor(public readonly message: MessageValue) {
        super('messageReceived');
    };
}

export class GroupInputEvent extends Events.Event {
    constructor(public readonly value: boolean|number|MessageValue, public readonly interfaceId: string) {
        super('groupInput');
    };
}

export class ReadyEvent extends Events.Event {
    constructor() {
        super('ready');
    };
}

export class DestroyEvent extends Events.Event {
    constructor() {
        super('destroy');
    };
}

export abstract class BaseConnector<T> extends Events.Emitter<ValueChangedEvent|MessageReceivedEvent|GroupInputEvent> {

    constructor (protected connector: Connector, protected tsBlockLib: TSBlockLib) {
        super();
    }

    public get name(): string {
        return this.connector.name;
    }

    public get displayName(): string {
        return this.connector.displayName;
    }

    public get type(): string {
        return Types.getStringsFromConnectorType(this.connector.type).type;
    }

    public get direction(): string {
        return Types.getStringsFromConnectorType(this.connector.type).direction;
    }

    public get lastMessage(): MessageValue {
        if (this.connector.lastMessage) {
            return {
                types: this.connector.lastMessage.argTypes.map((at) => Types.TypeToStringTable[at]),
                values: this.connector.lastMessage.values
            };
        }
        return null;
    }

    public get messageTypes(): Array<string> {
        if (this.connector.argTypes) {
            return this.connector.argTypes.map((at) => Types.TypeToStringTable[at]);
        }
        return null;
    }
}

export class InputConnector extends BaseConnector<boolean|number|MessageValue> {

    public get value(): boolean|number {
        return <boolean|number><any>this.connector.value;
    }

}

export class OutputConnector extends BaseConnector<boolean|number|MessageValue> {

    public get value():boolean|number {
        return <boolean|number><any>this.connector.value;
    }

    public set value(value: boolean|number) {
        if (typeof value === 'boolean' || typeof value === 'number') {
            this.tsBlockLib.sendValueToOutputConnector(this.connector, value);
        } else {
            throw new TSBlockError('Attempt to set wrong value on a connector. The type of value must be \'boolean\' or \'number\', but got \'' + typeof value + '\'')
        }
    }

    public send(message: Array<boolean|number|string>) {
        if (Array.isArray(message)) {
            this.tsBlockLib.sendValueToOutputConnector(this.connector, message);
        } else {
            throw new TSBlockError('Attempt to send invalid data. Message must be an array, but got \'' + typeof message + '\'')
        }
    }

    public groupOutput(value: boolean|number|Array<boolean|number|string>, interfaceId: string) {
        this.tsBlockLib.sendValueToOutputConnector(this.connector, value, interfaceId);
    }
}

export class ConfigPropertyWrapper extends Events.Emitter<ConfigValueChangedEvent> {

    constructor (protected configProperty: ConfigProperty, protected tsBlockLib: TSBlockLib) {
        super();
    }

    public get value():any {
        return this.configProperty.value;
    }

    public get name():string {
        return this.configProperty.name;
    }

    public get displayName():string {
        return this.configProperty.displayName;
    }

    public get type():string {
        return Types.ConfigPropertyTypeToStringTable[this.configProperty.type];
    }

}

export class TSBlockLib implements Library {

    public static libName: string = 'TSBlockLib';
    public static libTypings: string = Libs.ContextLibTypings+`
// BEGIN

// SERVICES

declare interface BlockServices {

}

declare interface BlockContext {

    /**
     * Backend services for block
     */
    readonly services: BlockServices;

    /**
     * Handler for construct, get and manage block config properties
     */
    readonly configProperties: ConfigPropertiesHandler;

    /**
     * Handler for construct, get and manage block inputs
     */
    readonly inputs: InputsHandler;

    /**
     * Handler for construct, get and manage block outputs
     */
    readonly outputs: OutputsHandler;

    /**
     * Adds event listener to block context
     * @param key Ready event
     * @param callback Callback with first param ContextReadyEvent object
     * @returns EventListener object, important for removing event listener
     */
    listenEvent(key: 'ready', callback: (event: ContextReadyEvent) => void): EventListener;

    /**
     * Adds event listener to block context
     * @param key Destroy event
     * @param callback Callback with first param ContextDestroyEvent object
     * @returns EventListener object, important for removing event listener
     */
    listenEvent(key: 'destroy', callback: (event: ContextDestroyEvent) => void): EventListener;

    /**
     * Remove event listener from block context
     * @param listener EventListener object to remove
     */
    removeListener(listener: EventListener): void;

}

declare const context: BlockContext;

// END
`;

    protected usedInputOutputNames:string[] = [];

    protected inputConnectors: { [name: string]: InputConnector } = {};
    protected outputConnectors: { [name: string]: OutputConnector } = {};
    protected configPropertiesConnectors: { [name: string]: ConfigPropertyWrapper } = {};

    protected inputConnectorsEmitter: Events.Emitter<ValueChangedEvent|MessageReceivedEvent> = new Events.Emitter<ValueChangedEvent|MessageReceivedEvent>();
    protected outputConnectorsEmitter: Events.Emitter<ValueChangedEvent|MessageReceivedEvent> = new Events.Emitter<ValueChangedEvent|MessageReceivedEvent>();
    protected configPropertiesConnectorsEmitter: Events.Emitter<ConfigValueChangedEvent> = new Events.Emitter<ConfigValueChangedEvent>();

    protected contextEmitter: Events.Emitter<ReadyEvent|DestroyEvent> = new Events.Emitter<ReadyEvent|DestroyEvent>();

    protected machine: Machine = null;

    constructor(private tsBlock: TSBlock) {

    }

    get name(): string {
        return TSBlockLib.libName;
    }

    public init() {
        return null;
    }

    public clean() {
        this.usedInputOutputNames = [];

        this.inputConnectors = {};
        this.outputConnectors = {};
        this.configPropertiesConnectors = {};

        this.inputConnectorsEmitter = new Events.Emitter<ValueChangedEvent|MessageReceivedEvent>();
        this.outputConnectorsEmitter = new Events.Emitter<ValueChangedEvent|MessageReceivedEvent>();
        this.configPropertiesConnectorsEmitter = new Events.Emitter<ConfigValueChangedEvent>();

        this.contextEmitter = new Events.Emitter<ReadyEvent|DestroyEvent>();
    }

    private nameValidator(name: string, method: string): void {
        if (typeof name != 'string' || name == '') {
            throw new TSBlockError(`In <b>${method}</b>: input/output name must be string and cannot be empty`);
        }
        if (!(/^[A-Za-z0-9]+$/.test(name))) {
            throw new TSBlockError(`In <b>${method}</b>: input/output name <b>${name}</b> is not valid, you can use only A-Z, a-z and 0-9 characters`);
        }
        if (this.usedInputOutputNames.indexOf(name.toLowerCase()) !== -1) {
            throw new TSBlockError(`In <b>${method}</b>: duplicate using of name <b>${name}</b>`);
        }
    };

    private argTypesValidator(argTypes:any, method:string):void {
        if (!Array.isArray(argTypes)) {
            throw new TSBlockError(`In <b>${method}</b>: message types parameter must be array`);
        }
        if (argTypes.length == 0) {
            throw new TSBlockError(`In <b>${method}</b>: message types parameter must contain at least 1 type`);
        }
        if (argTypes.length > 8) {
            throw new TSBlockError(`In <b>${method}</b>: message types parameter must contain maximal 8 type`);
        }
        argTypes.forEach((argType: any) => {
            if (
                (argType != Types.TypeToStringTable[Types.Type.Boolean]) &&
                (argType != Types.TypeToStringTable[Types.Type.Float]) &&
                (argType != Types.TypeToStringTable[Types.Type.Integer]) &&
                (argType != Types.TypeToStringTable[Types.Type.String])
            ) {
                throw new TSBlockError(`In <b>${method}</b>: message types parameter can contain only types: <b>'boolean'</b>, <b>'integer'</b>, <b>'float'</b>, <b>'string'</b>).`);
            }
        });
    };

    private getInputOutputType(type:string, direction:'input'|'output', method:string):Types.ConnectorType {
        let ct = Types.getConnectorTypeFromStrings(type, direction);
        if (ct) {
            return ct;
        }
        throw new TSBlockError(`In <b>${method}</b>: unknown ${direction} type <b>${type}</b>`);
    }

    private getConfigPropertyType(type:string, method:string):Types.ConfigPropertyType {
        let t = Types.StringToConfigPropertyTypeTable[type];
        if (t) {
            return t;
        }
        throw new TSBlockError(`In <b>${method}</b>: unknown config property type <b>${type}</b>`);
    }

    public sendValueToOutputConnector(connector: Connector, value: boolean|number|Array<boolean|number|string>, interfaceId?: string) {
        this.tsBlock.sendValueToOutputConnector({
            connector: connector,
            eventType:  null,
            value: Array.isArray(value) ? new Message(connector.argTypes.slice(0), value) : value,
            interfaceId: interfaceId
        });

        let strings = Types.getStringsFromConnectorType(connector.type);

        let tsEvent;
        if (interfaceId) {
            tsEvent = new GroupInputEvent(strings.type !== 'message' ? <boolean|number>value : <MessageValue>{
                types: connector.argTypes.map((at) => Types.TypeToStringTable[at]),
                values: value
            }, interfaceId)
        } else if (strings.type == 'message') {
            tsEvent = new MessageReceivedEvent({
                types: connector.argTypes.map((at) => Types.TypeToStringTable[at]),
                values: <Array<boolean|number|string>>value
            });
        } else {
            tsEvent = new ValueChangedEvent(<boolean|number>value);
        }

        if (strings.direction == 'input') {

            let connectorWrapper = this.inputConnectors[connector.name];

            if (connectorWrapper && tsEvent) {
                this.inputConnectorsEmitter.emit(connectorWrapper, tsEvent);
                connectorWrapper.emit(connectorWrapper, tsEvent);
            }

        } else if (strings.direction == 'output') {

            let connectorWrapper = this.outputConnectors[connector.name];

            if (connectorWrapper && tsEvent) {
                this.outputConnectorsEmitter.emit(connectorWrapper, tsEvent);
                connectorWrapper.emit(connectorWrapper, tsEvent);
            }
        }
    }

    public inputEvent(event: ConnectorEvent):void {
        if (this.machine) this.machine.call(() => {

            let strings = Types.getStringsFromConnectorType(event.connector.type);

            let tsEvent;
            if (event.eventType == ConnectorEventType.ValueChange) {
                tsEvent = new ValueChangedEvent(<boolean|number>event.value);
            } else if (event.eventType == ConnectorEventType.NewMessage) {
                let message = (<Message>event.value);
                tsEvent = new MessageReceivedEvent({
                    types: message.argTypes.map((at) => Types.TypeToStringTable[at]),
                    values: message.values
                });
            } else if (event.eventType == ConnectorEventType.GroupInput) {
                tsEvent = new GroupInputEvent(strings.type !== 'message' ? <boolean|number>event.value : <MessageValue>{
                    types: (<Message>event.value).argTypes.map((at) => Types.TypeToStringTable[at]),
                    values: (<Message>event.value).values
                }, event.interfaceId)
            }

            if (strings.direction == 'input') {

                let connectorWrapper = this.inputConnectors[event.connector.name];

                if (connectorWrapper && tsEvent) {
                    this.inputConnectorsEmitter.emit(connectorWrapper, tsEvent);
                    connectorWrapper.emit(connectorWrapper, tsEvent);
                }

            } else if (strings.direction == 'output') {

                let connectorWrapper = this.outputConnectors[event.connector.name];

                if (connectorWrapper && tsEvent) {
                    this.outputConnectorsEmitter.emit(connectorWrapper, tsEvent);
                    connectorWrapper.emit(connectorWrapper, tsEvent);
                }

            }
        });
    }

    public configChanged():void {
        if (this.machine) this.machine.call(() => {

            let out = {};
            this.tsBlock.getConfigProperties().forEach((cp) => {
                out[cp.name] = cp.value;
            });

            this.configPropertiesConnectorsEmitter.emit(null, new ConfigValueChangedEvent(out));

            // TODO: only changed values
            this.tsBlock.getConfigProperties().forEach((cp) => {
                if (this.configPropertiesConnectors.hasOwnProperty(cp.name)) {
                    let configProperty = this.configPropertiesConnectors[cp.name];
                    configProperty.emit(configProperty, new ConfigValueChangedEvent(configProperty.value));
                }
            });

        });
    }

    public callReady():void {
        if (this.machine) this.machine.call(() => {
            this.contextEmitter.emit(null, new ReadyEvent());
        });
    }

    public callDestroy():void {
        if (this.machine) this.machine.call(() => {
            this.contextEmitter.emit(null, new DestroyEvent());
        });
    }

    public external(machine: Machine): {[p: string]: any} {
        this.machine = machine;

        let context = {
            services: {

            },
            listenEvent: (key: string | string[], callback: (event: ReadyEvent|DestroyEvent) => void): Events.Listener<ReadyEvent|DestroyEvent> => {
                return this.contextEmitter.listenEvent(key, callback);
            },
            removeListener: (listener: Events.Listener<ReadyEvent|DestroyEvent>): void => {
                this.contextEmitter.removeListener(listener);
            },
            inputs: {
                add: (name:string, type:string, displayName:string, types?:Types.Type[]) => {
                    if (!this.tsBlock.canAddsIO) {
                        throw new TSBlockError(`You can add inputs only in first loop of your program`);
                    }
                    this.nameValidator(name, 'context.inputs.add');
                    let conType = this.getInputOutputType(type, 'input', 'context.inputs.add');
                    if (conType == Types.ConnectorType.MessageInput) {
                        this.argTypesValidator(types, 'context.inputs.add');
                    }
                    if (types && Array.isArray(types)) {
                        types = types.map((t) => Types.StringToTypeTable[t]);
                    }
                    // add to used names
                    this.usedInputOutputNames.push(name.toLowerCase());
                    // create input
                    let con = this.tsBlock.addInputConnector(name, conType, displayName, types);
                    // wrap it and store
                    let conWrapper = new InputConnector(con, this);
                    this.inputConnectors[name] = conWrapper;
                    return conWrapper;
                },
                get: (name:string) => {
                    if (this.inputConnectors.hasOwnProperty(name)) {
                        return this.inputConnectors[name];
                    }
                    return null;
                },
                listenEvent: (key: string | string[], callback: (event: ValueChangedEvent|MessageReceivedEvent|GroupInputEvent) => void): Events.Listener<ValueChangedEvent|MessageReceivedEvent|GroupInputEvent> => {
                    return this.inputConnectorsEmitter.listenEvent(key, callback);
                },
                removeListener: (listener: Events.Listener<ValueChangedEvent|MessageReceivedEvent|GroupInputEvent>): void => {
                    this.inputConnectorsEmitter.removeListener(listener);
                },
            },
            outputs: {
                add: (name:string, type:string, displayName:string, types?:Types.Type[]) => {
                    if (!this.tsBlock.canAddsIO) {
                        throw new TSBlockError(`You can add outputs only in first loop of your program`);
                    }
                    this.nameValidator(name, 'context.outputs.add');
                    let conType = this.getInputOutputType(type, 'output', 'context.outputs.add');
                    if (conType == Types.ConnectorType.MessageOutput) {
                        this.argTypesValidator(types, 'context.outputs.add');
                    }
                    if (types && Array.isArray(types)) {
                        types = types.map((t) => Types.StringToTypeTable[t]);
                    }
                    // add to used names
                    this.usedInputOutputNames.push(name.toLowerCase());
                    // create input
                    let con = this.tsBlock.addOutputConnector(name, conType, displayName, types);
                    // wrap it and store
                    let conWrapper = new OutputConnector(con, this);
                    this.outputConnectors[name] = conWrapper;
                    return conWrapper;
                },
                get: (name:string) => {
                    if (this.outputConnectors.hasOwnProperty(name)) {
                        return this.outputConnectors[name];
                    }
                    return null;
                },
                listenEvent: (key: string | string[], callback: (event: ValueChangedEvent|MessageReceivedEvent|GroupInputEvent) => void): Events.Listener<ValueChangedEvent|MessageReceivedEvent|GroupInputEvent> => {
                    return this.outputConnectorsEmitter.listenEvent(key, callback);
                },
                removeListener: (listener: Events.Listener<ValueChangedEvent|MessageReceivedEvent|GroupInputEvent>): void => {
                    this.outputConnectorsEmitter.removeListener(listener);
                },
            },
            configProperties: {
                add: (name:string, type:string, displayName:string, defaultValue:any, options?:any) => {
                    if (!this.tsBlock.canAddsIO) {
                        throw new TSBlockError(`You can add config properties only in first loop of your program`);
                    }
                    this.nameValidator(name, 'context.configProperties.add');
                    let cpType = this.getConfigPropertyType(type, 'context.configProperties.add');
                    // add to used names
                    this.usedInputOutputNames.push(name.toLowerCase());
                    // create config property
                    let cp = this.tsBlock.addConfigProperty(cpType, name, displayName, defaultValue, options);

                    // wrap it and store
                    let cpWrapper = new ConfigPropertyWrapper(cp, this);
                    this.configPropertiesConnectors[name] = cpWrapper;
                    return cpWrapper;
                },
                get: (name:string) => {
                    if (this.outputConnectors.hasOwnProperty(name)) {
                        return this.outputConnectors[name];
                    }
                    return null;
                },
                listenEvent: (key: string | string[], callback: (event: ConfigValueChangedEvent) => void): Events.Listener<ConfigValueChangedEvent> => {
                    return this.configPropertiesConnectorsEmitter.listenEvent(key, callback);
                },
                removeListener: (listener: Events.Listener<ConfigValueChangedEvent>): void => {
                    this.configPropertiesConnectorsEmitter.removeListener(listener);
                },
            },
        };

        Object.defineProperty(context.configProperties, 'description', {
            set: (val) => {
                if (val) {
                    this.tsBlock.configPropertiesDescription = val.toString();
                } else {
                    this.tsBlock.configPropertiesDescription = null;
                }
            },
            get: () => {
                return this.tsBlock.configPropertiesDescription;
            }
        });

        Object.defineProperty(context, '__safeCall', {
            get: () => {
                return this.machine.call;
            }
        });

        return {
            context: context
        }

    }


}