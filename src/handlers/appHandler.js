'use strict';

let Message = require('../models/message');
let aiml = require('../lib/aiml');
const userServiceHandler = require('./userServiceHandler');
const citibikeServiceHandler = require('./citibikeServiceHandler');
const Address = require('../models/address');
const Response = require('../models/response');

//exports
module.exports = {


    parseMessage: function (request, reply) {
        let message = request.payload;
        aiml.findAnswerInLoadedAIMLFiles(message.text, function (answer, wildCardArray, input) {
            switch (answer) {
                case "A":
                    if (wildCardArray.length > 0) {
                        let type = wildCardArray[0];
                        userServiceHandler.getUserByAddressType(message.userId, type, function (result, error) {
                            if (error) {
                                log.info("getUserByAddressType" + error);
                                reply("Server error - getting address")
                            } else {
                                let response = new Response(JSON.parse(result.body));
                                //user may have multiple! home address or no home address or one home 
                                //one home
                                if (response.statusCode === 1) {
                                    let address = new Address(response.data[0]);
                                    //call user service and get nearest stations
                                    let nearByAddPayload = {
                                        lon: address.lon,
                                        lat: address.lat
                                    };
                                    citibikeServiceHandler.addressNearBy(nearByAddPayload, function (result, error) {
                                        if (error) {
                                            log.info("citibikeServiceHandler.addressNearBy" + error);
                                            reply("Server error - getting addressNearBy from citibike api")
                                        } else {
                                            reply(result.body);
                                        }
                                    })

                                } else { // no home
                                    aiml.findAnswerInLoadedAIMLFiles("FORMAT : PLEASE PROVIDE YOUR " + type + " ADDRESS", function (answer, wildCardArray, input) {
                                        reply(answer);
                                    });
                                }
                            }
                        });
                    } else {
                        reply("");
                    }
                    break;

                case "B":
                    //reply("case B");
                    if (wildCardArray.length > 1) {
                        let payload = wildCardArray[1];
                        userServiceHandler.geocode(payload, function (result, error) {
                            if (error) {
                                log.info("getUserByAddressType" + error);
                                reply("Server error - getting address")
                            } else {
                                let response = new Response(JSON.parse(result.body));
                                if (response.statusCode === 1 && response.data.results != null && response.data.results.length > 0) {
                                    log.info("google returned location, updated user address in db")
                                    let userAddress = {};
                                    userAddress.user_id = message.userId;
                                    let location = response.data.results[0].geometry.location;
                                    userAddress.lon = location.lng;
                                    userAddress.lat = location.lat
                                    userAddress.type = wildCardArray[0];
                                    userAddress.address_str = response.data.results[0].formatted_address;
                                    userAddress.loc = [location.lng, location.lat];

                                    userServiceHandler.createOrUpdateUserAddress(userAddress, function (result, error) {
                                        if (error) {
                                            log.info("createOrUpdateUserAddress" + error);
                                            reply("Server error - update/save  user address ")
                                        } else {
                                            let responseAddressUpdate = new Response(result.body);
                                            if (responseAddressUpdate.statusCode === 1) {
                                                reply("address saved");
                                            } else {
                                                reply("unable to save your address");
                                            }
                                        }
                                    });
                                } else {
                                    log.info("status code - " + response.stat6usCode + " response.data.results either null or 0 length array ");
                                    reply("");
                                }

                            }
                        });
                    } else {
                        reply("");
                    }
                    break;
                default:
                    reply(answer);
            }


        });
    }
}