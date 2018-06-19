"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DigitalInput_1 = require("./DigitalInput");
class PushButton extends DigitalInput_1.DigitalInput {
    constructor(id) {
        super(id, 'pushButton');
        this.name = 'Button';
        this.description = 'TODO';
    }
}
exports.PushButton = PushButton;
