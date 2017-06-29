/**
 * Created by davidhradek on 12.04.16.
 */

import * as Core from '../Core/index';
import * as Blocks from './index';

export class Manager {
    static getAllBlocks():Array<Core.BlockClass> {
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
        ];
    }
}