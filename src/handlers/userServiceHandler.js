'use strict';

const log = require('../config/logger'),
    request = require('request'),
    settings = require('../config/settings');

const userServiceHandler = {

    updateInsertUser: function (payloadData, cb) {
        request({
            url: settings.userService,
            method: 'POST',
            json: payloadData
        }, function (error, response, body) {
            if (error)
                log.error("User update/insert failed, deails - " + error);
            if (response)
                log.info("User update/insert service response status message is " + response.statusMessage);

            cb(response, error);
        });
    },
    getUser: function (userId, cb) {

        request({
            url: settings.userService + '/' + userId,
            method: 'GET'

        }, function (error, response, body) {
            if (error)
                log.error("Get user failed error details - " + error);
            if (response)
                log.info("Get user  response status message is " + response.statusMessage);

            cb(response, error);
        });
    },
    getUserByAddressType: function (userId, addressType, cb) {

        request({
            url: settings.userService + '/' + userId + "/address/" + addressType,
            method: 'GET'

        }, function (error, response, body) {
            if (error)
                log.error("Get user ByAddressType failed error details -  " + error);
            if (response)
                log.info("Get user ByAddressType  response status message is - " + response.statusMessage);

            cb(response, error);
        });
    },
    createOrUpdateUserAddress: function (payloadData, cb) {
        request({
            url: settings.userService + "/address",
            method: 'POST',
            json: payloadData
        }, function (error, response, body) {
            if (error)
                log.error("Get user ByAddressType failed error details -  " + error);
            if (response)
                log.info("Get user ByAddressType  response status message is - " + response.statusMessage);

            cb(response, error);
        });
    },
    getUserAccounts: function (userId, cb) {
        request({
            url: settings.userService + '/' + userId + "/accounts",
            method: 'GET'

        }, function (error, response, body) {
            if (error) {
                log.error({
                    error: error
                }, "Get user accounts by user id  service failed ");
                cb(error, null);
            } else if (response.statusCode === 200) { //valid json body 
                log.info("Get user accounts by user id service successful");
                cb(null, JSON.parse(body));
            } else { //non 200 status
                log.error({
                    error: response
                }, "Get user accounts by user id service successful but unexpected statusCode  ");
                cb(response, null);
            };
        });
    }
}
module.exports = userServiceHandler;