'use strict';

const node_env = 'local'; //this need to be updated before cloud deployment
let getUserService = function () {
    if (node_env == 'local') {
        return `http://localhost:3001/v1/user`;
    } else {
        return `https://service-user.cfapps.io/v1/user`;
    }
}


let settings = {

    userService: getUserService(),
    citiBikeService: `http://service-citibike.cfapps.io/v1`,
    port: process.env.PORT || '3002',



}

module.exports = settings;