var ESRepository = require('./ESRepository');
var Player = require('../models/Player');
var Validator = require('no-if-validator').Validator;
var InstanceOfCondition = require('no-if-validator').InstanceOfCondition;

class PlayerESRepository extends ESRepository {
    constructor(client) {
        super(client);
    }

    get(playerId) {
        return new Promise((resolve, reject) => {
            super.get(playerId, 'yojuego', 'player')
                .then((objRet) => {
                    var player = new Player(objRet.resp.source.nickName, new Date(objRet.resp.source.birthDate), objRet.resp.source.state, objRet.resp.source.adminState, objRet.resp.source.userid);
                    player._id = objRet.resp._id
                    resolve({ code: 200, message: null, resp: player });
                }, reject);
        });
    }

    getByUserId(userid) {
        //TEST: full test require
        return new Promise((resolve, reject) => {
            this.esclient.search({
                "index": "yojuego",
                "type": "player",
                "body": {
                    "query": {
                        "bool": {
                            "filter": [
                                { "term": { "userid": userid } }
                            ]
                        }
                    }
                }
            }, (error, response) => {
                if (error) {
                    reject({ code: error.statusCode, message: error.message, resp: error });
                }
                else {
                    let player = null;

                    for (let i = 0; i < response.hits.hits.length; i++) {
                        player = new Player(response.hits.hits[i]._source.nickName, new Date(response.hits.hits[i]._source.birthDate), response.hits.hits[i]._source.state, response.hits.hits[i]._source.adminState, response.hits.hits[i]._source.userid);
                        player._id = response.hits.hits[i]._id;
                        break;
                    }

                    resolve({ code: 0, message: null, resp: player });
                }
            });
        });
    }

    add(player) {
        if (player instanceof Player) {
            return super.add(player, 'yojuego', 'player');
        } else {
            return Promise.reject({ code: 410, message: PlayerESRepository.INVALID_INSTANCE_PLAYER });
        }
    }

    update(player) {
        if (player instanceof Player) {
            let document = {
                nickName: player.nickName,
                birthDate: player.birthDate,
                state: player.state,
                adminState: player.adminState
            };
            return super.update(player._id, document, 'yojuego', 'player');
        } else {
            return Promise.reject({ code: 410, message: PlayerESRepository.INVALID_INSTANCE_PLAYER });
        }
    }

    static get INVALID_INSTANCE_PLAYER() {
        return 'This instance is not a player';
    }
}

module.exports = PlayerESRepository;
