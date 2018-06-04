import { Block } from '../../Core';

export class WebHook extends Block {

    protected apiKey: string;

    constructor(apiKey: string) {
        super(null, 'webHook', 'webHook');
        this.apiKey = apiKey;
    }
}
