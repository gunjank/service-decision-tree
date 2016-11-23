'use strict';

const log = require('../config/logger'),
    request = require('request'),
    settings = require('../config/settings');

let citibikeServiceHandler = {
    addressNearBy: function (payloadData, cb) {
        request({
            url: settings.citiBikeService + "/addressNearBy",
            method: 'POST',
            json: payloadData
        }, function (error, response, body) {
            if (error) log.error("Error getting near by stations from citibike api -  " + error);
            if (response) log.info("Got near by station response from citibike api and response status message is - " + response.statusMessage);
            cb(response, error);
        });
    }
}
module.exports = citibikeServiceHandler;