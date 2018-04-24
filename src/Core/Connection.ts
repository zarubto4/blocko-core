import { Connector } from './Connector';
import { IRenderer } from './Renderer';

export class Connection {
    public connectorA: Connector;
    public connectorB: Connector;

    public renderer: IRenderer;

    public constructor(connectorA: Connector, connectorB: Connector) {
        this.connectorA = connectorA;
        this.connectorB = connectorB;
    }

    public getOtherConnector(self: Connector): Connector {
        if (this.connectorA == self) {
            return this.connectorB;
        } else {
            return this.connectorA;
        }
    }

    public getInputConnector(): Connector {
        if (this.connectorA.isInput()) return this.connectorA;
        return this.connectorB;
    }

    public getOutputConnector(): Connector {
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