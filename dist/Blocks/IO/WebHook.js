"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Core_1 = require("../../Core");
class WebHook extends Core_1.Block {
    constructor(apiKey) {
        super(null, 'webHook', 'webHook');
        this.apiKey = apiKey;
    }
}
exports.WebHook = WebHook;
