"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Size {
    constructor(width = 0, height = 0) {
        this.width = width;
        this.height = height;
    }
    plus(p) {
        return new Size(this.width + p.width, this.height + p.height);
    }
    minus(p) {
        return new Size(this.width - p.width, this.height - p.height);
    }
    isEqual(p) {
        return ((this.width === p.width) && (this.height === p.height));
    }
}
exports.Size = Size;
