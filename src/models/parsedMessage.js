'use strict';

//messageCode 
/**
 * 0 = ERROR
 * 1 = NEAREST STATION LIST
 * 2 = ASKING FOR ADDRESS
 * 3 = ADDRESS SAVED
 * 4 = GREETINGS 
 * 5 = generic answer from aiml
 * 
 */
let ParsedMessage = function (o) {
    this.messageCode = o.messageCode;
    this.messageType = o.messageType;
    this.message = o.message; //text
    this.data = o.data; //json
    this.error = o.error;

}
module.exports = ParsedMessage;