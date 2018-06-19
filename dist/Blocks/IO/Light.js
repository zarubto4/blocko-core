"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DigitalOutput_1 = require("./DigitalOutput");
class Light extends DigitalOutput_1.DigitalOutput {
    constructor(id) {
        super(id, 'light');
        this.name = 'D-OUT';
        this.description = 'TODO';
    }
}
exports.Light = Light;
