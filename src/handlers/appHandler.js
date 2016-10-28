'use strict';

let Message = require('../models/message');
let ParsedMessage = require('../models/parsedMessage');
let aiml = require('../lib/aiml');
const userServiceHandler = require('./userServiceHandler');
const citibikeServiceHandler = require('./citibikeServiceHandler');
const Address = require('../models/address');
const Response = require('../models/response');

//exports
module.exports = {


    parseMessage: function (request, reply) {
        let message = request.payload;
        let parsedMessage = new ParsedMessage({});
        aiml.findAnswerInLoadedAIMLFiles(message.text, function (answer, wildCardArray, input) {
            switch (answer) {
                case "A":
                    if (wildCardArray.length > 0) {
                        let type = wildCardArray[0];
                        userServiceHandler.getUserByAddressType(message.userId, type, function (result, error) {
                            if (error) {
                                log.info("getUserByAddressType" + error);
                                parsedMessage.error = error;
                                parsedMessage.messageType = "error";
                                parsedMessage.messageCode = 0;
                                parsedMessage.message = "Server error - getting address";
                                reply(parsedMessage);
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
                                            parsedMessage.error = error;
                                            parsedMessage.messageType = "error";
                                            parsedMessage.messageCode = 0;
                                            parsedMessage.message = "Server error - getting addressNearBy from citibike api";
                                            reply(parsedMessage);
                                        } else {

                                            parsedMessage.messageType = "nearest_station_list";
                                            parsedMessage.messageCode = 1;
                                            parsedMessage.message = "nearest stations";
                                            parsedMessage.data = result.body
                                            reply(parsedMessage);
                                        }
                                    })

                                } else { // no home
                                    aiml.findAnswerInLoadedAIMLFiles("FORMAT : PLEASE PROVIDE YOUR " + type + " ADDRESS", function (answer, wildCardArray, input) {
                                        parsedMessage.messageType = "need_address";
                                        parsedMessage.messageCode = 2;
                                        parsedMessage.message = "asking for address";
                                        parsedMessage.data = {
                                            msg: answer
                                        }
                                        reply(parsedMessage);
                                    });
                                }
                            }
                        });
                    } else {
                        parsedMessage.error = {
                            msg: "given address type is invalid"
                        };
                        parsedMessage.messageType = "error";
                        parsedMessage.messageCode = 0;
                        parsedMessage.message = "given address type is invalid";
                        reply(parsedMessage);
                    }
                    break;

                case "B":
                    //reply("case B");
                    if (wildCardArray.length > 1) {
                        let payload = wildCardArray[1];
                        userServiceHandler.geocode(payload, function (result, error) {
                            if (error) {
                                log.info("getUserByAddressType" + error);
                                parsedMessage.error = error;
                                parsedMessage.messageType = "error";
                                parsedMessage.messageCode = 0;
                                parsedMessage.message = "Server error - getting address";
                                reply(parsedMessage);
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
                                            parsedMessage.error = error;
                                            parsedMessage.messageType = "error";
                                            parsedMessage.messageCode = 0;
                                            parsedMessage.message = "Server error - update/save  user address";
                                            reply(parsedMessage);
                                        } else {
                                            let responseAddressUpdate = new Response(result.body);
                                            if (responseAddressUpdate.statusCode === 1) {



                                                parsedMessage.messageType = "address_saved";
                                                parsedMessage.messageCode = 3;
                                                parsedMessage.message = "given address saved successfully";
                                                parsedMessage.data = {
                                                    msg: "address saved"
                                                }
                                                reply(parsedMessage);

                                            } else {
                                                parsedMessage.error = {
                                                    msg: "unable to save your address"
                                                };
                                                parsedMessage.messageType = "error";
                                                parsedMessage.messageCode = 0;
                                                parsedMessage.message = "unable to save your address";
                                                reply(parsedMessage);

                                            }
                                        }
                                    });
                                } else {
                                    log.info("status code - " + response.stat6usCode + " response.data.results either null or 0 length array ");
                                    parsedMessage.error = {
                                        msg: "matching stations response.data.results either null or 0 length array"
                                    };
                                    parsedMessage.messageType = "error";
                                    parsedMessage.messageCode = 0;
                                    parsedMessage.message = "matching result not found correctly";
                                    reply(parsedMessage);
                                }

                            }
                        });
                    } else {
                        parsedMessage.error = {
                            msg: "given address type is invalid or address having invalid characters"
                        };
                        parsedMessage.messageType = "error";
                        parsedMessage.messageCode = 0;
                        parsedMessage.message = "given address type is invalid";
                        reply(parsedMessage);
                    }
                    break;
                case "C":
                    parsedMessage.messageType = "show_map";
                    parsedMessage.messageCode = 4;
                    parsedMessage.message = "dummy map data";
                    parsedMessage.data = {
                        msg: "map data"
                    }
                    reply(parsedMessage);
                    break;
                default:
                    parsedMessage.messageType = "error";
                    parsedMessage.messageCode = 0;
                    parsedMessage.error = {
                        msg: "matching question not found"
                    }
                    parsedMessage.message = "matching question not found";
                    reply(parsedMessage);
            }


        });
    }
}