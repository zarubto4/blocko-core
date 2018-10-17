"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Blocks = require("./index");
class Manager {
    static getAllBlocks() {
        return [
            Blocks.Switch,
            Blocks.PushButton,
            Blocks.Light,
            Blocks.And,
            Blocks.Or,
            Blocks.Xor,
            Blocks.Not,
            Blocks.TSBlock,
            Blocks.AnalogInput,
            Blocks.AnalogOutput,
            Blocks.InputsInterfaceBlock,
            Blocks.OutputsInterfaceBlock,
            Blocks.WebHook,
            Blocks.DatabaseBlock
        ];
    }
}
exports.Manager = Manager;
