'use strict';

var User = function (o) {

    this.userId = o.user_id;
    this.lon = o.lon;
    this.lat = o.lat;
    this.type = o.type;
    this.addressStr = o.address_str;
    this.loc = o.loc;

}

module.exports = User;