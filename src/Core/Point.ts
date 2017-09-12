

export class Point {
    public x:number;
    public y:number;

    public constructor(x:number = 0, y:number = 0) {
        this.x = x;
        this.y = y;
    }

    public plus(p:Point):Point {
        return new Point(this.x + p.x, this.y + p.y);
    }

    public minus(p:Point):Point {
        return new Point(this.x - p.x, this.y - p.y);
    }
}