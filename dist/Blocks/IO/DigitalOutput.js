"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_lib_1 = require("common-lib");
const Core_1 = require("../../Core");
class DigitalOutput extends Core_1.Block {
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
