import * as Core from '../../Core/index';
import { Types } from 'common-lib';
import { ConnectorEvent } from '../../Core';
import { ConnectorEventType } from '../../Core/Connector';
import { Message } from '../../Core/Message';

export class Not extends Core.Block {

    public connectorInput: Core.Connector<boolean|number|Message|Object>;
    public connectorOutput: Core.Connector<boolean|number|Message|Object>;

    public constructor(id: string) {
        super(id, 'not', 'not');
        this.connectorInput = this.addInputConnector('input', Types.ConnectorType.DigitalInput);
        this.connectorOutput = this.addOutputConnector('output', Types.ConnectorType.DigitalOutput);
    }

    protected afterControllerSet() {
        this.inputsChanged();
    }

    public rendererGetDisplayName(): string {
        return 'NOT';
    }

    public inputsChanged(): void {
        let event: ConnectorEvent = {
            connector: this.connectorOutput,
            eventType:  ConnectorEventType.ValueChange,
            value: this.connectorInput.value === 0 ? 1 : 0
        };
        this.sendValueToOutputConnector(event);
    }

    protected inputChanged(event: ConnectorEvent): void {
        this.inputsChanged();
    }
}
