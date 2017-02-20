let Validator = require('no-if-validator').Validator;
let NotNullOrUndefinedCondition = require('no-if-validator').NotNullOrUndefinedCondition;
let Routes = require('./Routes');
let Group = require('../models/Group');
let GroupRepository = require('../repositories/GroupESRepository');
let FriendshipRepository = require('../repositories/FriendshipESRepository');
let moment = require('moment');

let repoFriendship = null;
let repoGroup = null;

class GroupRoutes extends Routes {
    constructor(esClient) {
        super();

        this._addPlayer = this._addPlayer.bind(this);
        this._removePlayer = this._removePlayer.bind(this);
        this._updateGroup = this._updateGroup.bind(this);
        this._getGroup = this._getGroup.bind(this);
        this._getAllGroups = this._getAllGroups.bind(this);
        this._createGroup = this._createGroup.bind(this);
        this._deleteGroup = this._deleteGroup.bind(this);
        this._makeAdminPlayer = this._makeAdminPlayer.bind(this);
        this._checkPlayerMember = this._checkPlayerMember.bind(this);
        this._checkPlayerFriends = this._checkPlayerFriends.bind(this);

        let validator = new Validator();
        validator.addCondition(new NotNullOrUndefinedCondition(esClient).throw(GroupRoutes.INVALID_ES_CLIENT));

        validator.execute(() => {
            repoGroup = new GroupRepository(esClient);
            repoFriendship = new FriendshipRepository(esClient);
        }, (err) => { throw err; });
    }

    _addAllRoutes(server) {
        server.get('/group/:id', super._paramsIsNotNull, this._getGroup, this._checkPlayerMember, (req, res, next) => { res.json(200, { code: 200, resp: req.group, message: 'Group created' }) });
        server.get('/group', this._getAllGroups, (req, res, next) => { res.json(200, { code: 200, resp: req.groups, message: null }) });
        server.post('/group/create', super._bodyIsNotNull, this._checkPlayerFriends, this._createGroup, (req, res, next) => { res.json(200, { code: 200, resp: req.group, message: null }) });
        server.post('/group/:id/addPlayer', super._paramsIsNotNull, this._getGroup, this._addPlayer, this._updateGroup, (req, res, next) => { res.json(200, { code: 200, resp: req.group, message: null }) });
        server.post('/group/:id/removePlayer', super._paramsIsNotNull, this._getGroup, this._removePlayer, this._updateGroup, (req, res, next) => { res.json(200, { code: 200, resp: req.group, message: null }) });
        server.post('/group/:id/makeAdminPlayer', super._paramsIsNotNull, this._getGroup, this._makeAdminPlayer, this._updateGroup, (req, res, next) => { res.json(200, { code: 200, resp: req.group, message: null }) });
        server.del('/group/:id', super._paramsIsNotNull, this._getGroup, this._deleteGroup, (req, res, next) => { res.json(200, { code: 200, resp: req.group, message: null }) });
    }

    _getGroup(req, res, next) {
        repoGroup.get(req.params.id)
            .then((groupResp) => {
                if (!groupResp.resp) {
                    res.json(404, { code: 404, message: 'Grupo inexistente', resp: null });
                } else {
                    req.group = groupResp.resp;
                    next();
                }
            }, (cause) => {
                res.json(404, { code: 404, message: cause, resp: null });
            })
            .catch((err) => {
                res.json(500, { code: 500, message: err, resp: null });
            });
    }

    _getAllGroups(req, res, next) {
        repoGroup.getByPlayerId(req.player._id)
            .then((resp) => {
                req.groups = resp.resp;
                next();
            }, (cause) => {
                res.json(404, { code: 404, message: cause, resp: null });
            })
            .catch((err) => {
                res.json(500, { code: 500, message: err, resp: null });
            });
    }

    _createGroup(req, res, next) {

        let group = new Group(req.body.players, [req.player._id], req.body.description, req.body.photo, req.player._id, new Date());
        group.groupAudit = {
            createdBy: req.body.platform || 'MOBILE_APP', //We should store deviceId here
            createdOn: new Date(),
            createdFrom: req.body.platform || 'MOBILE_APP',
            modifiedBy: null,
            modifiedOn: null,
            modifiedFrom: null
        }

        repoGroup.add(group)
            .then((resp) => {
                repoGroup.get(resp.resp._id)
                    .then((groupResp) => {
                        req.group = groupResp.resp;
                        next();
                    }, (cause) => {
                        res.json(404, { code: 404, message: cause, resp: null });
                    })
                    .catch((err) => {
                        res.json(500, { code: 500, message: err, resp: null });
                    });
            }, (cause) => {
                res.json(404, { code: 404, message: cause, resp: null });
            })
            .catch((err) => {
                res.json(500, { code: 500, message: err, resp: null });
            });
    }

    _addPlayer(req, res, next) {
        try {
            req.group.addPlayer(req.player._id, req.body.playerId);
            next();
        } catch (error) {
            res.json(404, { code: 404, message: error, resp: null });
        }
    }

    _removePlayer(req, res, next) {
        try {
            req.group.removePlayer(req.player._id, req.body.playerId);
            next();
        } catch (error) {
            res.json(404, { code: 404, message: error, resp: null });
        }
    }

    _makeAdminPlayer(req, res, next) {
        try {
            req.group.makeAdmin(req.player._id, req.body.playerId);
            next();
        } catch (error) {
            res.json(404, { code: 404, message: error, resp: null });
        }
    }

    _deleteGroup(req, res, next) {
        let group = req.group;
        repoGroup.delete(group)
            .then((resp) => {
                next();
            }, (cause) => {
                res.json(404, { code: 404, message: cause, resp: null });
            })
            .catch((err) => {
                res.json(500, { code: 500, message: err, resp: null });
            });
    }

    _updateFriendshipsByFriend(req, res, next) {
        next();
        //UPDATE BY QUERY
        // repoFriendship.get(req.friendship.friendId)
        //     .then((resp) => {
        //         for (let i = 0; i < resp.resp.length; i++) {
        //             let toUpdate = resp.resp[i];
        //             toUpdate.status = 'DELETED';
        //             toUpdate.info = null;

        //             repoFriendship.update(toUpdate)
        //                 .then((resp) => {

        //                 }, (cause) => {
        //                     res.json(404, { code: 404, message: cause, resp: null });
        //                 })
        //                 .catch((err) => {
        //                     res.json(500, { code: 500, message: err, resp: null });
        //                 });
        //         }
        //         next();
        //     }, (cause) => {
        //         res.json(404, { code: 404, message: cause, resp: null });
        //     })
        //     .catch((err) => {
        //         res.json(500, { code: 500, message: err, resp: null });
        //     });
    }

    _checkPlayerMember(req, res, next) {
        if (req.group.isMember(req.player._id))
            next();
        else
            res.json(400, { code: 400, message: 'El player no es miembro del group.', resp: null });
    }

    _checkPlayerFriends(req, res, next) {
        repoFriendship.getByPlayerId(req.player._id)
            .then((resp) => {
                let notFriends = [];

                for (let i = 0; i < req.body.players.length; i++) {
                    if (!this._isFriend(req.body.players[i], resp.resp))
                        notFriends.push(req.body.players[i]._id);
                }

                if (notFriends.length > 0)
                    res.json(404, { code: 404, message: 'There are player who are not your friends, they must accept your friendship request before you can invite them.', resp: notFriends });
                else
                    next();
            }, (cause) => {
                res.json(404, { code: 404, message: cause, resp: null });
            })
            .catch((err) => {
                res.json(500, { code: 500, message: err, resp: null });
            });
    }

    _updateGroup(req, res, next) {
        req.group.groupAudit.modifiedBy = req.player._id; //We should store deviceId here
        req.group.groupAudit.modifiedOn = new Date();
        req.group.groupAudit.modifiedFrom = req.body.platform;

        repoGroup.update(req.group)
            .then((resp) => {
                req.group = resp.resp;
                next();
            }, (cause) => {
                res.json(404, { code: 404, message: cause, resp: null });
            })
            .catch((err) => {
                res.json(500, { code: 500, message: err, resp: null });
            });
    }

    _isFriend(id, friends) {
        for (let i = 0; i < friends.length; i++) {
            if (friends[i].friendId == id)
                return true;
        }
        return false;
    }

    static get INVALID_ES_CLIENT() {
        return 'El cliente de ElasticSearch no puede ser null ni undefined';
    }
}

module.exports = GroupRoutes;