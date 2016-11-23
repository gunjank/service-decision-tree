'use strict';

const log = require('../config/logger'),
    ParsedMessage = require('../models/parsedMessage'),
    aiml = require('../lib/aiml'),
    userServiceHandler = require('./userServiceHandler'),
    googleApiServiceHandler = require('./googleApiServiceHandler'),
    citibikeServiceHandler = require('./citibikeServiceHandler'),
    Address = require('../models/address'),
    Response = require('../models/response');

const punctRE = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\.\/:;<=>?\[\]^_`{|}~]/g;
const spaceRE = /\s+/g;

//supporting methods
const messageType2 = function (reply, msg) {
    const parsedMessage = new ParsedMessage({});
    parsedMessage.messageType = "need_address_to_save";
    parsedMessage.messageCode = 2;
    parsedMessage.message = msg;
    reply(parsedMessage);
}
const messageType3 = function (reply) {
    const parsedMessage = new ParsedMessage({});
    parsedMessage.messageType = "address_saved";
    parsedMessage.messageCode = 3;
    parsedMessage.message = "Given address saved successfully!";
    reply(parsedMessage);
}
const messageType4 = function (reply) {
    const parsedMessage = new ParsedMessage({});
    parsedMessage.messageType = "greetings";
    parsedMessage.messageCode = 4;
    parsedMessage.message = "greetings template";
    reply(parsedMessage);
}
const messageType5 = function (reply, msg) {
    const parsedMessage = new ParsedMessage({});
    parsedMessage.messageType = "generic_answer";
    parsedMessage.messageCode = 5;
    parsedMessage.message = msg;
    reply(parsedMessage);
}
const messageType6 = function (reply, msg) { //video
    const parsedMessage = new ParsedMessage({});
    parsedMessage.messageType = "video";
    parsedMessage.messageCode = 6;
    parsedMessage.message = msg;
    reply(parsedMessage);
}

const commonErrorHelp = function (reply) {
    aiml.findAnswerInLoadedAIMLFiles("ERROR MESSAGE", function (answer) {
        const re = new RegExp('@@@', 'gi');
        answer = answer.replace(re, "\r\n");
        messageType5(reply, answer);
    });
}

const messageType7 = function (reply, userId) { //accounts
    const parsedMessage = new ParsedMessage({});
    userServiceHandler.getUserAccounts(userId, (error, response) => {
        if (error) {
            log.error({
                error: error,
            }, 'method messageType7, getUserAccounts got error or null response/body ');
            commonErrorHelp(reply);
        } else {
            if (response.statusCode === 1) {
                parsedMessage.messageType = "accounts_available";
                parsedMessage.messageCode = 7;
                parsedMessage.data = response.data;
                parsedMessage.message = response.message;
            } else {
                parsedMessage.messageType = "no_account_found";
                parsedMessage.messageCode = 8;
                parsedMessage.message = "No matching record found";
            }
            reply(parsedMessage);
        }
    });
}; //end of messageType7



const nearByAddressService = function (reply, nearByAddPayload) {
    citibikeServiceHandler.addressNearBy(nearByAddPayload, function (error, body) {
        if (error) {
            log.info("citibikeServiceHandler.addressNearBy - Server error - getting addressNearBy from citibike api" + error);
            commonErrorHelp(reply);
        } else {
            const parsedMessage = new ParsedMessage({});
            parsedMessage.messageType = "nearest_station_list";
            parsedMessage.messageCode = 1;
            parsedMessage.message = "nearest stations";
            parsedMessage.data = body
            reply(parsedMessage);
        }
    }); //end of addressNearBy
}

//exports start 
module.exports = {
    parseMessage: function (request, reply) {
            const message = request.payload;
            message.text = message.text.replace(punctRE, '').replace(spaceRE, ' ');
            log.info("message to parse - " + message.text);

            aiml.findAnswerInLoadedAIMLFiles(message.text, function (answer, wildCardArray) {
                switch (answer) {
                    case "A":
                        if (wildCardArray.length > 0) {
                            log.info("wildCardArray - " + wildCardArray);
                            const addressTypeOrStr = wildCardArray[0].trim();
                            if (addressTypeOrStr.split(" ").length > 1) { // e.g show me bike near 135 river drive  
                                //call google api and get address text and lat long
                                const payload = 'citibike ' + addressTypeOrStr;
                                log.info("Calling googleApiServiceHandler.placeGeocode with pay load  - " + addressTypeOrStr);
                                googleApiServiceHandler.placeGeocode(payload, function (error, result) {
                                    if (error) {
                                        log.info("placeGeocode - erver error - getting address" + error);
                                        commonErrorHelp(reply);
                                    } else {
                                        //asdf
                                        const response = new Response(JSON.parse(body));
                                        if (response.statusCode === 1 && response.data.results != null && response.data.results.length > 0) {
                                            log.info("google returned location, good to go for station search ");
                                            const location = response.data.results[0].geometry.location;
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
                                //end of call googleApiServiceHandler.placeGeocode
                            } else { //wildCardArray found only one word and assume it is work or home or similar address 
                                log.info("Calling userServiceHandler.getUserByAddressType with pay load  - " + addressTypeOrStr);
                                userServiceHandler.getUserByAddressType(message.userId, addressTypeOrStr, function (result, error) {
                                    if (error) {
                                        log.info("getUserByAddressType - Server error - getting address" + error);
                                        commonErrorHelp(reply);
                                    } else {
                                        const response = new Response(JSON.parse(result.body));
                                        //user will have only one address for each type or no address for given type    
                                        if (response.statusCode === 1) { //status code means user address found
                                            const address = new Address(response.data[0]);
                                            //call user service and get nearest stations
                                            const nearByAddPayload = {
                                                lon: address.lon,
                                                lat: address.lat
                                            };
                                            nearByAddressService(reply, nearByAddPayload);

                                        } else { // no matching address found 
                                            aiml.findAnswerInLoadedAIMLFiles("FORMAT : PLEASE PROVIDE YOUR " + addressTypeOrStr + " ADDRESS", function (answer) {
                                                messageType2(reply, answer);
                                            });
                                        }
                                    } //end of else for user address by type success
                                }); //end of user address by type service call
                            } //if and else both covered for template A 

                        } else { //TEMPLATE A BUT NO * OR SEARCH KEYWORD FOUND 
                            aiml.findAnswerInLoadedAIMLFiles("ASK FOR ADDRESS", function (answer) {
                                messageType5(reply, answer);
                            });
                        }
                        break;

                    case "B":
                        if (wildCardArray.length > 1) {
                            const payload = wildCardArray[1];
                            googleApiServiceHandler.placeGeocode(payload, function (error, body) {
                                if (error) {
                                    log.info("placeGeocode - Server error - getting address" + error);
                                    commonErrorHelp(reply);
                                } else {
                                    const response = new Response(JSON.parse(body));
                                    if (response.statusCode === 1 && response.data.results != null && response.data.results.length > 0) {
                                        log.info("google returned location, updated user address in db")
                                        const userAddress = {};
                                        userAddress.user_id = message.userId;
                                        const location = response.data.results[0].geometry.location;
                                        userAddress.lon = location.lng;
                                        userAddress.lat = location.lat
                                        userAddress.type = wildCardArray[0];
                                        userAddress.address_str = response.data.results[0].formatted_address;
                                        userAddress.loc = [location.lng, location.lat];

                                        userServiceHandler.createOrUpdateUserAddress(userAddress, function (result, error) {
                                            if (error) {
                                                log.error("createOrUpdateUserAddress -  Server error - update/save  user address" + error);
                                                commonErrorHelp(reply);
                                            } else {
                                                const responseAddressUpdate = new Response(result.body);
                                                if (responseAddressUpdate.statusCode === 1) {
                                                    messageType3(reply);
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
                        messageType4(reply);
                        break;
                    case "D":
                        if (wildCardArray.length > 1) {
                            const re = new RegExp("DOT");
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
                    case "E": //video
                        messageType6(reply, answer)
                        break;
                    case "F": //accounts
                        messageType7(reply, message.userId)
                        break;
                    default:
                        if (answer != null && answer !== "") {
                            messageType5(reply, answer);
                        } else {
                            commonErrorHelp(reply);

                        }
                        break;
                }
            }); //initial aiml ends here 
        } //parseMessage functio ends here 
}; //module export ends here