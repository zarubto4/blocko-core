import { Types } from 'common-lib';
import { Block, ConfigProperty, Connector, ConnectorEvent, DigitalConnector } from '../../Core';
import { ConnectorEventType } from '../../Core/Connector';
import { Message } from '../../Core/Message';

export class Or extends Block {

    public connectorOutput: DigitalConnector;

    protected confInputsCount: ConfigProperty;
    protected confNegate: ConfigProperty;

    public constructor(id: string) {
        super(id, 'or');
        this.name = 'OR';
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

        let out = false;

        this.inputConnectors.forEach((con: Connector<boolean|number|object|Message>) => {
            if (con.value) {
                out = true;
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

    protected inputChanged(event: ConnectorEvent): void {
        this.inputsChanged();
    }
}
