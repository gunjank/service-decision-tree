'use strict';



let settings = {

    userService: `https://service-user.cfapps.io/v1/user`,
    userServiceLocal: `http://localhost:3001/v1/user`,
    port: process.env.PORT || '3002',



}

module.exports = settings;