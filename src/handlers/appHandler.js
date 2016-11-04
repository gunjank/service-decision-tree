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
                log.info(message.text);
                aiml.findAnswerInLoadedAIMLFiles(message.text, function (answer, wildCardArray, input) {
                    switch (answer) {
                        case "A":
                            if (wildCardArray.length > 0) {
                                let addressTypeOrStr = wildCardArray[0];
                                if (addressTypeOrStr.split(" ").length > 1) { // e.g show me bike near 135 river drive  
                                    //call google api and get address text and lat long
                                    const payload = 'citibike ' + addressTypeOrStr;
                                    googleApiServiceHandler.placeGeocode(payload, function (result, error) {
                                        if (error) {
                                            log.info("placeGeocode - erver error - getting address" + error);
                                            commonErrorHelp(reply);
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
                                                nearByAddressService(reply, nearByAddPayload);
                                            } //else of placeGeocode response validation
                                            else {
                                                log.info("status code - " + response.statusCode + " response.data.results either null or 0 length array for placeGeocode service ");
                                                commonErrorHelp(reply);
                                            } //end of placeGeocode response validation
                                        } //end of geo code success handler 
                                    });
                                    //end of call citibikeServiceHandler.addressNearBy
                                } else { //wildCardArray found only one word and assume it is work or home or similar address 
                                    userServiceHandler.getUserByAddressType(message.userId, addressTypeOrStr, function (result, error) {
                                        if (error) {
                                            log.info("getUserByAddressType - Server error - getting address" + error);
                                            commonErrorHelp(reply);
                                        } else {
                                            let response = new Response(JSON.parse(result.body));
                                            //user will have only one address for each type or no address for given type                                             
                                            //log.info("user address by type response " + JSON.stringify(response));
                                            if (response.statusCode === 1) { //status code means user address found
                                                let address = new Address(response.data[0]);
                                                //call user service and get nearest stations
                                                let nearByAddPayload = {
                                                    lon: address.lon,
                                                    lat: address.lat
                                                };
                                                nearByAddressService(reply, nearByAddPayload);

                                            } else { // no matching address found 
                                                aiml.findAnswerInLoadedAIMLFiles("FORMAT : PLEASE PROVIDE YOUR " + addressTypeOrStr + " ADDRESS", function (answer, wildCardArray, input) {
                                                    parsedMessage.messageType = "need_address_to_save";
                                                    parsedMessage.messageCode = 2;
                                                    parsedMessage.message = answer;
                                                    reply(parsedMessage);
                                                });
                                            }
                                        } //end of else for user address by type success
                                    }); //end of user address by type service call
                                } //if and else both covered for template A 

                            } else { //TEMPLATE A BUT NO * OR SEARCH KEYWORD FOUND 
                                aiml.findAnswerInLoadedAIMLFiles("ASK FOR ADDRESS", function (answer, wildCardArray, input) {
                                    messageType5(reply, answer);
                                });
                            }
                            break;

                        case "B":
                            //reply("case B");
                            if (wildCardArray.length > 1) {
                                let payload = wildCardArray[1];
                                googleApiServiceHandler.placeGeocode(payload, function (result, error) {
                                    if (error) {
                                        log.info("placeGeocode - Server error - getting address" + error);
                                        commonErrorHelp(reply);
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
                                                    log.info("createOrUpdateUserAddress -  Server error - update/save  user address" + error);
                                                    commonErrorHelp(reply);
                                                } else {
                                                    let responseAddressUpdate = new Response(result.body);
                                                    if (responseAddressUpdate.statusCode === 1) {
                                                        parsedMessage.messageType = "address_saved";
                                                        parsedMessage.messageCode = 3;
                                                        parsedMessage.message = "Given address saved successfully!";
                                                        reply(parsedMessage);

                                                    } else {
                                                        log.info("unable to save your address");
                                                        commonErrorHelp(reply);

                                                    }
                                                }
                                            });
                                        } else {
                                            log.info("status code - " + response.statusCode + " response.data.results either null or 0 length array for placeGeocode service ");
                                            commonErrorHelp(reply);
                                        }

                                    }
                                });
                            } else {
                                commonErrorHelp(reply);
                            }
                            break;
                        case "C":
                            parsedMessage.messageType = "greetings";
                            parsedMessage.messageCode = 4;
                            parsedMessage.message = "greetings template";
                            reply(parsedMessage);
                            break;
                        case "D":
                            if (wildCardArray.length > 1) {
                                let re = new RegExp("DOT");
                                const nearByAddPayload = {
                                    lat: wildCardArray[0].replace(re, "."),
                                    lon: wildCardArray[1].replace(re, ".")
                                };
                                nearByAddressService(reply, nearByAddPayload);

                            } else {
                                log.info("template D but wildCardArray length is less than 2 ")
                                commonErrorHelp(reply);
                            }
                            break;
                        default:
                            if (answer != null && answer != "") {
                                messageType5(reply, answer);
                            } else {
                                commonErrorHelp(reply);

                            }
                            break;
                    }
                }); //initial aiml ends here 
            } //parseMessage functio ends here 
    } //module export ends here

let commonErrorHelp = function (reply) {
    aiml.findAnswerInLoadedAIMLFiles("ERROR MESSAGE", function (answer, wildCardArray, input) {
        let re = new RegExp('@@@', 'gi');
        answer = answer.replace(re, "\r\n");
        messageType5(reply, answer);
    });
}
let messageType5 = function (reply, msg) {
    let parsedMessage = new ParsedMessage({});
    parsedMessage.messageType = "generic_answer";
    parsedMessage.messageCode = 5;
    parsedMessage.message = msg;
    reply(parsedMessage);
}
let nearByAddressService = function (reply, nearByAddPayload) {
    citibikeServiceHandler.addressNearBy(nearByAddPayload, function (result, error) {
        if (error) {
            log.info("citibikeServiceHandler.addressNearBy - Server error - getting addressNearBy from citibike api" + error);
            commonErrorHelp(reply);
        } else {
            let parsedMessage = new ParsedMessage({});
            parsedMessage.messageType = "nearest_station_list";
            parsedMessage.messageCode = 1;
            parsedMessage.message = "nearest stations";
            parsedMessage.data = result.body
            reply(parsedMessage);
        }
    }); //end of addressNearBy
}