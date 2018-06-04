"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Core = require("../../Core/index");
const common_lib_1 = require("common-lib");
const Connector_1 = require("../../Core/Connector");
class And extends Core.Block {
    constructor(id) {
        super(id, 'and', 'and');
        this.confInputsCount = this.addConfigProperty(common_lib_1.Types.ConfigPropertyType.Integer, 'inputsCount', 'Inputs count', 2, {
            range: true,
            min: 1,
            max: 16
        });
        this.confNegate = this.addConfigProperty(common_lib_1.Types.ConfigPropertyType.Boolean, 'negate', 'Negate', false);
        this.connectorOutput = this.addOutputConnector('output', common_lib_1.Types.ConnectorType.DigitalOutput);
        this.configChanged();
    }
    afterControllerSet() {
        this.inputsChanged();
    }
    rendererGetDisplayName() {
        return 'AND';
    }
    configChanged() {
        let wantedCount = this.confInputsCount.value;
        let currentCount = this.inputConnectors.length;
        let i;
        if (wantedCount > currentCount) {
            for (i = currentCount; i < wantedCount; i++) {
                this.addInputConnector('in' + i, common_lib_1.Types.ConnectorType.DigitalInput, 'Input ' + (i + 1));
            }
        }
        else {
            for (i = wantedCount; i < currentCount; i++) {
                let c = this.getInputConnectorById('in' + i);
                if (c) {
                    this.removeInputConnector(c);
                }
            }
        }
        this.inputsChanged();
        if (this.renderer) {
            this.renderer.refresh();
        }
    }
    inputsChanged() {
        let out = true;
        this.inputConnectors.forEach((con) => {
            if (!con.value) {
                out = false;
            }
        });
        if (this.confNegate.value) {
            out = !out;
        }
        let event = {
            connector: this.connectorOutput,
            eventType: Connector_1.ConnectorEventType.ValueChange,
            value: out ? 1 : 0
        };
        this.sendValueToOutputConnector(event);
    }
    inputChanged(event) {
        this.inputsChanged();
    }
}
exports.And = And;
