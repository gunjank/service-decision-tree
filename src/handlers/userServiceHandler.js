'use strict';


var request = require('request');
const settings = require('../config/settings');

let userServiceHandler = {

    updateInsertUser: function (payloadData, cb) {
        request({
            url: settings.userService,
            method: 'POST',
            json: payloadData
        }, function (error, response, body) {
            if (error) log.error("User update/insert failed, deails - " + error);
            if (response) log.info("User update/insert service response status message is " + response.statusMessage);
            // if (body) log.debug("User update/insert service body -  " + body);
            cb(response, error);
        });
    },
    getUser: function (userId, cb) {

        request({
            url: settings.userService + '/' + userId,
            method: 'GET'

        }, function (error, response, body) {
            if (error) log.error("Get user failed error details - " + error);
            if (response) log.info("Get user  response status message is " + response.statusMessage);
            cb(response, error);
        });
    },
    getUserByAddressType: function (userId, addressType, cb) {

        request({
            url: settings.userService + '/' + userId + "/address/" + addressType,
            method: 'GET'

        }, function (error, response, body) {
            if (error) log.error("Get user ByAddressType failed error details -  " + error);
            if (response) log.info("Get user ByAddressType  response status message is - " + response.statusMessage);
            cb(response, error);
        });
    },
    createOrUpdateUserAddress: function (payloadData, cb) {
        request({
            url: settings.userService + "/address",
            method: 'POST',
            json: payloadData
        }, function (error, response, body) {
            if (error) log.error("Get user ByAddressType failed error details -  " + error);
            if (response) log.info("Get user ByAddressType  response status message is - " + response.statusMessage);
            cb(response, error);
        });
    }





}
module.exports = userServiceHandler;