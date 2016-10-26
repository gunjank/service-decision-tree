'use strict';

let Message = require('../models/message');
let aiml = require('../lib/aiml');
const userServiceHandler = require('./userServiceHandler');
const Address = require('../models/address');
const Response = require('../models/response');

//exports
module.exports = {

    // getFeeds: function (request, reply) {
    //     let resultFeed = {};
    //     resultFeed.data = [];
    //     for (var i = 0; i < 5; i++) {
    //         let feed = new Feed;
    //         feed.feedId = "ABC" + Math.round(Math.random() * 1000);
    //         feed.feedDesc = "this is feed description for " + feed.feedId;
    //         resultFeed.data.push(feed);
    //     }

    //     reply(resultFeed);
    // },
    // getFeed: function (request, reply) {
    //     let feedId = request.params.feedId;
    //     let feed = new Feed;
    //     feed.feedId = feedId;
    //     feed.feedDesc = "this is feed description";
    //     reply(feed);
    // },
    parseMessage: function (request, reply) {
        let message = request.payload;
        aiml.findAnswerInLoadedAIMLFiles(message.text, function (answer, wildCardArray, input) {
            switch (answer) {
                case "A":
                    let type = wildCardArray[0].toLowerCase();
                    userServiceHandler.getUserByAddressType(message.userId, type, function (result) {

                        reply(result.body);
                    });
                    break;
                default:
                    reply(answer);
            }


        });
    }
}