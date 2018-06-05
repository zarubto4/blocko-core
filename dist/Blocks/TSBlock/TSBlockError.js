"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TSBlockError extends Error {
    constructor(htmlMessage) {
        super(htmlMessage.replace(/(<([^>]+)>)/ig, ''));
        this.name = 'TSBlockError';
        this.message = htmlMessage.replace(/(<([^>]+)>)/ig, '');
        this.htmlMessage = htmlMessage;
        this.__proto__ = TSBlockError.prototype;
    }
}
exports.TSBlockError = TSBlockError;
