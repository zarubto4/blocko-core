"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Point {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    plus(p) {
        return new Point(this.x + p.x, this.y + p.y);
    }
    minus(p) {
        return new Point(this.x - p.x, this.y - p.y);
    }
}
exports.Point = Point;
