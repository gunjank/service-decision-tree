'use strict';


let getUserService = function () {
    if (process.env.NODE_ENV === 'PRODUCTION') {
        return `https://service-user.cfapps.io/v1/user`;
    } else {
        return `http://localhost:3001/v1/user`;
    }
}

let getGoogleApiService = function () {
    if (process.env.NODE_ENV === 'PRODUCTION') {
        return `https://service-google-api.cfapps.io/v1/googleApi`;
    } else {
        return `http://localhost:3004/v1/googleApi`;
    }
}

let getCitiBikeService = function () {
    if (process.env.NODE_ENV === 'PRODUCTION') {
        return `https://service-citibike.cfapps.io/v1`;
    } else {
        return `http://localhost:3001/v1/googleApi/v1`;
    }
}


let settings = {
    userService: getUserService(),
    googleApiService: getGoogleApiService(),
    citiBikeService: getCitiBikeService(),
    noAddressFound: `I was unable to find that address. Please try a different address!`,
    port: process.env.PORT || '3002'
}

module.exports = settings;