import * as Core from '../../Core/index';
import { Types } from 'common-lib';
import { ConnectorEvent } from '../../Core';

export class AnalogOutput extends Core.Block {

    public connectorInput: Core.Connector;

    public constructor(id: string) {
        super(id, "analogOutput", "analogOutput");
        this.connectorInput = this.addInputConnector("input", Types.ConnectorType.AnalogInput, "Input");
    }

    public rendererGetBlockBackgroundColor(): string {
        return "#d1e7d1";
    }

    public rendererGetDisplayName(): string {
        return (<number>this.connectorInput.value).toFixed(1);
    }

    protected inputChanged(event: ConnectorEvent): void {
        if (this.renderer) {
            this.renderer.refreshDisplayName();
        }
    }
}
