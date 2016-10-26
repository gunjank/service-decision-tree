'use strict';

const Joi = require('joi');
let appHandler = require('../handlers/appHandler');

module.exports = function (server, options) {
    // read


    // server.route({
    //     method: 'get',
    //     path: '/v1/feeds',
    //     config: {
    //         handler: appHandler.getFeeds,
    //         description: 'GET all available feeds',
    //         notes: 'Returns a list of feeds',
    //         tags: ['api'],
    //         validate: {
    //             //No input to validat 
    //         }
    //     }
    // });
    // server.route({
    //     method: 'get',
    //     path: '/v1/feeds/{feedId}',
    //     config: {
    //         handler: appHandler.getFeed,
    //         description: 'GET feed for given id',
    //         notes: 'Returns a feed',
    //         tags: ['api'],
    //         validate: {
    //             params: {
    //                 feedId: Joi.string()
    //             }
    //         }
    //     }
    // });
    //write 
    server.route({
        method: 'post',
        path: '/v1/message',
        config: {
            handler: appHandler.parseMessage,
            description: 'Parse given message and return  details',
            notes: 'Returns prased message',
            tags: ['api'],
            validate: {
                payload: Joi.object({
                    userId: Joi.string().required(),
                    text: Joi.string().required()
                }),
            }
        }
    });
}