//This should be configured individually for each environment
process.env.NODE_ENV = 'dev';

let database = require('./src/services/database/index');
let loginAdmin = require('./src/services/loginAdmin/index');
let websocket = require('./src/services/websocket/index');
let notifications = require('./src/services/notifications/index');
let restify = require('restify');
let config = require('config');
let es = require('elasticsearch');
let esClient = new es.Client({
    host: config.get('dbConfig').database,
    log: 'info'
});

database(restify, config, esClient)
loginAdmin(restify, config, esClient)
websocket(restify, config, esClient)
notifications(restify, config, esClient)
