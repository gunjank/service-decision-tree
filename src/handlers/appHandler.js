'use strict';

let Message = require('../models/message');
let ParsedMessage = require('../models/parsedMessage');
let aiml = require('../lib/aiml');
const userServiceHandler = require('./userServiceHandler');
const googleApiServiceHandler = require('./googleApiServiceHandler');
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
                        let addressTypeOrStr = wildCardArray[0];
                        if (addressTypeOrStr.split(" ").length > 1) { // e.g show me bike near 135 river drive  
                            //call google api and get address text and lat long
                            const payload = addressTypeOrStr;
                            googleApiServiceHandler.placeGeocode(payload, function (result, error) {
                                if (error) {
                                    log.info("getUserByAddressType" + error);
                                    parsedMessage.error = error;
                                    parsedMessage.messageType = "error";
                                    parsedMessage.messageCode = 0;
                                    parsedMessage.message = "Server error - getting address";
                                    reply(parsedMessage);
                                } else {
                                    //asdf
                                    let response = new Response(JSON.parse(result.body));
                                    if (response.statusCode === 1 && response.data.results != null && response.data.results.length > 0) {
                                        log.info("google returned location, good to go for station search ");
                                        let location = response.data.results[0].geometry.location;
                                        const nearByAddPayload = {
                                            lon: location.lng,
                                            lat: location.lat
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
                                        }); //end of addressNearBy
                                    } //else of placeGeocode response validation
                                    else {
                                        log.info("status code - " + response.statusCode + " response.data.results either null or 0 length array for placeGeocode service ");
                                        parsedMessage.error = {
                                            msg: "matching address not found through placeGeocode service"
                                        };
                                        parsedMessage.messageType = "error";
                                        parsedMessage.messageCode = 0;
                                        parsedMessage.message = "matching address not found through placeGeocode service";
                                        reply(parsedMessage);
                                    } //end of placeGeocode response validation
                                } //end of geo code success handler 
                            });
                            //call citibikeServiceHandler.addressNearBy
                        } else {
                            userServiceHandler.getUserByAddressType(message.userId, addressTypeOrStr, function (result, error) {
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
                                        });

                                    } else { // no home
                                        aiml.findAnswerInLoadedAIMLFiles("FORMAT : PLEASE PROVIDE YOUR " + addressTypeOrStr + " ADDRESS", function (answer, wildCardArray, input) {
                                            parsedMessage.messageType = "need_address_to_save";
                                            parsedMessage.messageCode = 2;
                                            parsedMessage.message = answer;
                                            reply(parsedMessage);
                                        });
                                    }
                                }
                            });
                        } //if and else both covered

                    } else { //TEMPLATE A BUT NO * OR SEARCH KEYWORD FOUND 
                        aiml.findAnswerInLoadedAIMLFiles("ASK FOR ADDRESS", function (answer, wildCardArray, input) {
                            parsedMessage.messageType = "generic_answer";
                            parsedMessage.messageCode = 5;
                            parsedMessage.message = answer;
                            reply(parsedMessage);
                        });
                    }
                    break;

                case "B":
                    //reply("case B");
                    if (wildCardArray.length > 1) {
                        let payload = wildCardArray[1];
                        googleApiServiceHandler.placeGeocode(payload, function (result, error) {
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
                                                parsedMessage.message = "Given address saved successfully!";
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
                                    log.info("status code - " + response.statusCode + " response.data.results either null or 0 length array for placeGeocode service ");
                                    parsedMessage.error = {
                                        msg: "matching address not found through placeGeocode service"
                                    };
                                    parsedMessage.messageType = "error";
                                    parsedMessage.messageCode = 0;
                                    parsedMessage.message = "matching address not found through placeGeocode service";
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
                    parsedMessage.messageType = "greetings";
                    parsedMessage.messageCode = 4;
                    parsedMessage.message = "greetings template";
                    reply(parsedMessage);
                    break;
                default:


                    if (answer != null && answer != "") {
                        parsedMessage.messageType = "generic_answer";
                        parsedMessage.messageCode = 5;
                        parsedMessage.message = answer;
                        reply(parsedMessage);
                    } else {
                        parsedMessage.messageType = "error";
                        parsedMessage.messageCode = 0;
                        parsedMessage.error = {
                            msg: "no template found"
                        }
                        parsedMessage.message = "no template found";
                        reply(parsedMessage);
                    }

                    break;
            }


        });
    }
}