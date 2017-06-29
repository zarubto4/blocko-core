"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BlockRegistration {
    constructor(blockClass, type, visualType, displayName) {
        this.blockClass = blockClass;
        this.type = type;
        this.visualType = visualType;
        this.displayName = displayName;
    }
}
exports.BlockRegistration = BlockRegistration;
