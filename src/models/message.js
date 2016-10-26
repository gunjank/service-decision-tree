'use strict';

let Message = function () {
    //constructor 
}
Message.prototype.userId = function (userId) {
    this.userId = userId;
}
Message.prototype.text = function (text) {
    this.text = text;
}

module.exports = Message;