'use strict';

const getUserService = function () {
    if (process.env.NODE_ENV === 'PRODUCTION') {
        return `https://service-user.cfapps.io/v1/user`;
    } else {
        return `http://localhost:3001/v1/user`;
    }
}

const getGoogleApiService = function () {
    if (process.env.NODE_ENV === 'PRODUCTION') {
        return `https://service-google-api.cfapps.io/v1/googleApi`;
    } else {
        return `http://localhost:3004/v1/googleApi`;
    }
}

const getCitiBikeService = function () {
    if (process.env.NODE_ENV === 'PRODUCTION') {
        return `https://service-citibike.cfapps.io/v1`;
    } else {
        return `http://localhost:3001/v1/googleApi/v1`;
    }
}

const settings = {
    userService: getUserService(),
    googleApiService: getGoogleApiService(),
    citiBikeService: getCitiBikeService(),
    port: process.env.PORT || '3002'
}

module.exports = settings;