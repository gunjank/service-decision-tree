'use strict';

const Joi = require('joi');
let appHandler = require('../handlers/appHandler');

module.exports = function (server, options) {

    server.route({
        method: 'post',
        path: '/v1/message',
        config: {
            handler: appHandler.parseMessage,
            description: 'Parse given message and return  details',
            notes: 'All fields are required',
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