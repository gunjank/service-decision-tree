'use strict';

const log = require('./config/logger'),
    path = require('path'),
    Lout = require('lout'),
    Good = require('good'),
    GoodFile = require('good-file'),
    Hapi = require('hapi'),
    Inert = require('inert'),
    Vision = require('vision'),
    HapiSwagger = require('hapi-swagger'),
    settings = require('./config/settings'),
    Pack = require('../package');

/**
 * Construct the server
 */
const server = new Hapi.Server({
    connections: {
        routes: {
            cors: true,
            log: true
        },
        router: {
            stripTrailingSlash: true
        }
    }
});
log.info('server constructed');

/**
 * Create the connection
 */
// port: config.port

server.connection({
    port: settings.port

});

const swaggerOptions = {
    info: {
        'title': 'API Documentation',
        'version': Pack.version
    }
};

server.register([Inert, Vision, {
    'register': HapiSwagger,
    'options': swaggerOptions
}], function (err) {
    err ? log.info("Inert or Vision plugin failed, it will stop swagger") : log.info("Inert or Vision plugin registered, it will start  swagger");
});



/**
 * Build a logger for the server & each service
 */
const reporters = [new GoodFile({
    log: '*'
}, __dirname + '/../logs/server.log')];
//if you want to serve static files 
server.route({
    method: 'get',
    path: '/{param*}',
    handler: {
        directory: {
            path: __dirname + '/../public',
            listing: true
        }
    }
});

/**
 * Add logging
 */
server.register({
    register: Good,
    options: {
        opsInterval: 1000,
        reporters: reporters
    }
}, function (err) {
    if (err) throw new Error(err);

    log.debug({
        reporters: reporters
    }, 'registered Good for logging with reporters: ');
});

/**
 * Add /docs route
 */
server.register({
    register: Lout
}, function (err) {
    if (err) throw new Error(err);
    log.info('added Lout for /docs');
});

/**
 * If this isn't for testing, start the server
 */

server.start(function (err) {
    if (err) throw new Error(err);
    log.info('server started!');
    const summary = server.connections.map(function (cn) {
        return {
            labels: cn.settings.labels,
            uri: cn.info.uri
        };
    });
    const appRoute = require(__dirname + '/routes/appRoute')(server);
    log.info('Connections: ', summary);
    server.log('server', 'started: ' + JSON.stringify(summary));
});

module.exports = server;