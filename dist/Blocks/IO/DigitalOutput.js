"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Core = require("../../Core/index");
const common_lib_1 = require("common-lib");
class DigitalOutput extends Core.Block {
    constructor(id, visibleType) {
        super(id, 'digitalOutput', visibleType);
        this.connectorInput = this.addInputConnector('input', common_lib_1.Types.ConnectorType.DigitalInput);
    }
    inputChanged(event) {
        if (this.renderer) {
        }
    }
}
exports.DigitalOutput = DigitalOutput;
