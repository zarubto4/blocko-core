/**
 * Created by davidhradek on 11.07.16.
 */

export class Size {
    public width:number;
    public height:number;

    public constructor(width:number = 0, height:number = 0) {
        this.width = width;
        this.height = height;
    }

    public plus(p:Size):Size {
        return new Size(this.width + p.width, this.height + p.height);
    }

    public minus(p:Size):Size {
        return new Size(this.width - p.width, this.height - p.height);
    }

    public isEqual(p:Size):boolean {
        return ((this.width == p.width) && (this.height == p.height));
    }
}