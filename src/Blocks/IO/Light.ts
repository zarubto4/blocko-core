import { DigitalOutput } from './DigitalOutput';

export class Light extends DigitalOutput {

    public constructor(id: string) {
        super(id, 'light');
        this.name = 'D-OUT';
        this.description = 'TODO';
    }

    // TODO
}
