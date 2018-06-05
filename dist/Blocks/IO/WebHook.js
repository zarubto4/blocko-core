"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Core_1 = require("../../Core");
const common_lib_1 = require("common-lib");
class WebHook extends Core_1.Block {
    constructor(apiKey) {
        super(null, 'webHook', 'webHook');
        this._apiKey = apiKey;
        this.output = this.addOutputConnector('output', common_lib_1.Types.ConnectorType.JsonOutput, 'JSON Output');
    }
    get apiKey() {
        return this._apiKey;
    }
    getJsonOutput() {
        return this.output;
    }
}
exports.WebHook = WebHook;
