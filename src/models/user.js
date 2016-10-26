'use strict';

var User = function (o) {
    this.firstName = o.first_name;
    this.lastName = o.last_Name;
    this.userId = o.user_id;
    this.address = o.address;
    this.favouriteStation = o.favourite_station;

}

module.exports = User;