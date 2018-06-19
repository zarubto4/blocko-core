import { Types } from 'common-lib';
import { ConnectorEventType, DigitalConnector, ConnectorEvent } from '../../Core/Connector';
import { Message } from '../../Core/Message';
import { Block, ConfigProperty, Connector } from '../../Core';

export class And extends Block {

    public connectorOutput: DigitalConnector;

    protected confInputsCount: ConfigProperty;
    protected confNegate: ConfigProperty;

    public constructor(id: string) {
        super(id, 'and');
        this.name = 'AND';
        this.description = 'Logical operator AND sets the output value to \'true\' if all inputs are also \'true\'.';
    }

    public initialize(): void {
        this.confInputsCount = this.addConfigProperty(Types.ConfigPropertyType.Integer, 'inputsCount', 'Inputs count', 2, {
            range: true,
            min: 1,
            max: 16
        });
        this.confNegate = this.addConfigProperty(Types.ConfigPropertyType.Boolean, 'negate', 'Negate', false);

        this.connectorOutput = <DigitalConnector>this.addOutputConnector('output', Types.ConnectorType.DigitalOutput);
        this.configChanged();

        this.inputsChanged();
    }

    public configChanged(): void {
        let wantedCount = this.confInputsCount.value;
        let currentCount = this.inputConnectors.length;
        let i;
        if (wantedCount > currentCount) {
            for (i = currentCount; i < wantedCount; i++) {
                this.addInputConnector('in' + i, Types.ConnectorType.DigitalInput, 'Input ' + (i + 1));
            }
        } else {
            for (i = wantedCount; i < currentCount; i++) {
                let c = this.getInputConnectorById('in' + i);
                if (c) {
                    this.removeInputConnector(c);
                }
            }
        }
        this.inputsChanged();

        // TODO render refresh?
    }

    public inputsChanged(): void {

        let out = true;

        this.inputConnectors.forEach((con: Connector<boolean|number|object|Message>) => {
            if (!con.value) {
                out = false;
            }
        });

        if (this.confNegate.value) {
            out = !out;
        }

        let event: ConnectorEvent = {
            connector: this.connectorOutput,
            eventType:  ConnectorEventType.ValueChange,
            value: out
        };

        this.sendValueToOutputConnector(event);
    }

    protected inputChanged(event): void {
        this.inputsChanged();
    }
}
