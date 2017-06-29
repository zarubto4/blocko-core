/**
 * Created by davidhradek on 12.01.17.
 */

export class TSBlockError extends Error {

    htmlMessage:string;

    constructor(htmlMessage:string) {
        super(htmlMessage.replace(/(<([^>]+)>)/ig, ""));
        this.name = "TSBlockError";
        this.message = htmlMessage.replace(/(<([^>]+)>)/ig, "");
        this.htmlMessage = htmlMessage;

        (<any>this).__proto__ = TSBlockError.prototype;
    }

}