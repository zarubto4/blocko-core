"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Core = require("../../Core/index");
const common_lib_1 = require("common-lib");
class DigitalInput extends Core.Block {
    constructor(id, visibleType) {
        super(id, 'digitalInput', visibleType);
        this.connectorOutput = this.addOutputConnector('output', common_lib_1.Types.ConnectorType.DigitalOutput);
    }
}
exports.DigitalInput = DigitalInput;
