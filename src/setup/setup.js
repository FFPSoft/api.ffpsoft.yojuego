var es = require('elasticsearch');
var createUser = require('./createUser');
var createPlayer = require('./createPlayer');
var createMatch = require('./createMatch');
// var createInvitation = require('./createInvitation');
var createFriendship = require('./createFriendship');
var createGroup = require('./createGroup');
var config = require('config');
var client = new es.Client({
    host: config.dbConfig.database,
    log: 'info'
});

let createSchema = (client) => {
    return client.indices.create({ index: 'yojuego' })
        .then(() => {
            return createUser(client);
        })
        .then(() => {
            return createPlayer(client);
        })
        .then(() => {
            return createMatch(client);
        })
        // .then(() => {
        //     return createInvitation(client);
        // })
        .then(() => {
            return createFriendship(client);
        })
        .then(() => {
            return createGroup(client);
        })
        .catch((err) => {
            console.log('err: ' + JSON.stringify(err));
        });
}

module.exports = createSchema;