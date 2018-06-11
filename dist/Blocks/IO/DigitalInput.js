"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_lib_1 = require("common-lib");
const Core_1 = require("../../Core");
class DigitalInput extends Core_1.Block {
    initialize() {
        this.connectorOutput = this.addInputConnector('input', common_lib_1.Types.ConnectorType.DigitalInput);
    }
}
exports.DigitalInput = DigitalInput;
