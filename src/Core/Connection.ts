import { Connector } from './Connector';
import { Message } from './Message';
import { DestroyEvent, IOEvent } from './Events';
import { Events } from 'common-lib';

export class Connection extends Events.Emitter<IOEvent|DestroyEvent> {
    public connectorA: Connector<boolean|number|object|Message>;
    public connectorB: Connector<boolean|number|object|Message>;

    public constructor(connectorA: Connector<boolean|number|object|Message>, connectorB: Connector<boolean|number|object|Message>) {
        super();
        this.connectorA = connectorA;
        this.connectorB = connectorB;
    }

    public getOtherConnector(self: Connector<boolean|number|object|Message>): Connector<boolean|number|object|Message> {
        if (this.connectorA === self) {
            return this.connectorB;
        } else {
            return this.connectorA;
        }
    }

    public getInputConnector(): Connector<boolean|number|object|Message> {
        return this.connectorA.isInput() ? this.connectorA : this.connectorB;
    }

    public getOutputConnector(): Connector<boolean|number|object|Message> {
        return this.connectorA.isOutput() ? this.connectorA : this.connectorB;
    }

    public disconnect() {

        this.connectorA._removeConnection(this);
        this.connectorB._removeConnection(this);

        if (this.connectorA && this.connectorA.block && this.connectorA.block.controller) {
            this.connectorA.block.controller._removeConnection(this);
        } else if (this.connectorB && this.connectorB.block && this.connectorB.block.controller) {
            this.connectorB.block.controller._removeConnection(this);
        }

        this.emit(this, new DestroyEvent());
    }
}
