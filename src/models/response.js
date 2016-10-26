'use strict';


let Response = function (o) {
    this.statusCode = o.statusCode;
    this.message = o.message;
    this.data = o.data;
    this.error = o.error;

}
module.exports = Response;