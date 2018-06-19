"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Core_1 = require("../../Core");
const common_lib_1 = require("common-lib");
class WebHook extends Core_1.Block {
    constructor() {
        super(null, 'webHook');
        this.name = 'WebHook';
        this.description = 'WebHook serves as a HTTP endpoint, which sends the body of the HTTP request to its output connector, if requested.';
    }
    initialize() {
        this.output = this.addOutputConnector('output', common_lib_1.Types.ConnectorType.JsonOutput, 'JSON Output');
    }
    getJsonOutput() {
        return this.output;
    }
}
exports.WebHook = WebHook;
