'use strict';


let ParsedMessage = function (o) {
    this.messageCode = o.messageCode;
    this.messageType = o.messageType;
    this.message = o.message; //text
    this.data = o.data; //json
    this.error = o.error;

}
module.exports = ParsedMessage;