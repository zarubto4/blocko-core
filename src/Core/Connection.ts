import { Connector } from './Connector';
import { IRenderer } from './Renderer';
import { Message } from './Message';

export class Connection {
    public connectorA: Connector<boolean|number|Message|Object>;
    public connectorB: Connector<boolean|number|Message|Object>;

    public renderer: IRenderer;

    public constructor(connectorA: Connector<boolean|number|Message|Object>, connectorB: Connector<boolean|number|Message|Object>) {
        this.connectorA = connectorA;
        this.connectorB = connectorB;
    }

    public getOtherConnector(self: Connector<boolean|number|Message|Object>): Connector<boolean|number|Message|Object> {
        if (this.connectorA == self) {
            return this.connectorB;
        } else {
            return this.connectorA;
        }
    }

    public getInputConnector(): Connector<boolean|number|Message|Object> {
        if (this.connectorA.isInput()) return this.connectorA;
        return this.connectorB;
    }

    public getOutputConnector(): Connector<boolean|number|Message|Object> {
        if (this.connectorA.isOutput()) return this.connectorA;
        return this.connectorB;
    }

    public disconnect() {

        this.connectorA._removeConnection(this);
        this.connectorB._removeConnection(this);

        if (this.connectorA && this.connectorA.block && this.connectorA.block.controller) {
            this.connectorA.block.controller._removeConnection(this);
        } else if (this.connectorB && this.connectorB.block && this.connectorB.block.controller) {
            this.connectorB.block.controller._removeConnection(this);
        }

        if (this.renderer) this.renderer.destroy();

    }
}