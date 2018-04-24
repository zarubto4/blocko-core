
import { DigitalOutput } from "./DigitalOutput";

export class Light extends DigitalOutput {

    public constructor(id:string) {
        super(id, "light");
    }

    public rendererGetDisplayName():string {
        return 'D-OUT';
    }

}