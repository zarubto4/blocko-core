"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DigitalOutput_1 = require("./DigitalOutput");
class Light extends DigitalOutput_1.DigitalOutput {
    constructor(id) {
        super(id, "light");
    }
    rendererGetDisplayName() {
        return (this.connectorInput.value) ? "fa-star" : "fa-star-o";
    }
}
exports.Light = Light;
