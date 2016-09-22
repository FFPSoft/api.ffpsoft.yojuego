var ESRepository = require('./ESRepository');
var User = require('../models/User');
var FacebookUser = require('../models/FacebookUser');
var GoogleUser = require('../models/GoogleUser');
var YoJuegoUser = require('../models/YoJuegoUser');
var UserType = require('../constants/UserType');

class UserESRepository extends ESRepository {
    constructor(client) {
        super(client);
    }

    get(userId) {
        return new Promise((resolve, reject) => {
            super.get(userId, 'yojuego', 'user')
                .then((objRet) => {
                    var user = new User(objRet.resp.source.type, objRet.resp.source.id);
                    user._id = objRet.resp._id;
                    resolve({ code: 0, message: null, resp: user });
                }, reject);
        });
    }

    getByIdAndType(id, type) {
        //TEST: not null, not undefined
        //TEST: instance of string both
        return new Promise((resolve, reject) => {
            this.esclient.search({
                "index": "yojuego",
                "type": "user",
                "body": {
                    "query": {
                        "bool": {
                            "filter": [
                                { "term": { "type": type } },
                                { "term": { "id": id } }
                            ]
                        }
                    }
                }
            }, (error, response) => {
                if (error) {
                    reject({ code: error.statusCode, message: error.message, resp: error });
                }
                else {
                    let user = null;

                    for (let i = 0; i < response.hits.hits.length; i++) {
                        switch (response.hits.hits[i]._source.type) {
                            case UserType.facebook:
                                user = new FacebookUser(response.hits.hits[i]._source.id);
                                break;
                            case UserType.google:
                                user = new GoogleUser(response.hits.hits[i]._source.id);
                                break;
                            case UserType.yoJuego:
                                user = new YoJuegoUser(response.hits.hits[i]._source.id, response.hits.hits[i]._source.password);
                                break;
                        }
                        
                        user._id = response.hits.hits[i]._id;
                        break;
                    }

                    resolve({ code: 0, message: null, resp: user });
                }
            });
        });
    }

    add(user) {
        //TEST: not null, not undefined
        //TEST: instance of User
        return super.add(user, 'yojuego', 'user');
    }

    update(user) {
        //TEST: not null, not undefined
        //TEST: instance of User
        throw new Error();
    }

    delete(user) {
        //TEST: not null, not undefined
        //TEST: instance of User
        throw new Error();
    }

    static get INVALID_USER() {
        return "Invalid User";
    }
}

module.exports = UserESRepository