let Validator = require('no-if-validator').Validator;
let NotNullOrUndefinedCondition = require('no-if-validator').NotNullOrUndefinedCondition;
let Routes = require('./Routes');
let Match = require('../models/Match');
let PushNotification = require('../models/PushNotification');
let PushNotificationType = require('../constants/PushNotificationType');
let MatchInvitation = require('../NotificationService/models/MatchInvitation');
let MatchRepository = require('../repositories/MatchESRepository');
let PlayerRepository = require('../repositories/PlayerESRepository');
let MatchInvitationRepository = require('../NotificationService/repositories/MatchInvitationESRepository');
let DeviceESRepository = require('../repositories/DeviceESRepository');
let moment = require('moment');
let NotificationService = require('../NotificationService/NotificationService');

let repoMatch = null;
let repoMatchInvitation = null;
let repoPlayer = null;
let repoDevices = null;
let notificationService = null;

class MatchRoutes extends Routes {
    constructor(esClient) {
        super();

        this._createMatch = this._createMatch.bind(this);
        this._getArrayFromString = this._getArrayFromString.bind(this);
        this._searchByUpcoming = this._searchByUpcoming.bind(this);
        this._sendNotifications = this._sendNotifications.bind(this);
        this._getMatchInvitations = this._getMatchInvitations.bind(this);
        this._getMatch = this._getMatch.bind(this);
        this._removePlayer = this._removePlayer.bind(this);
        this._confirmPlayer = this._confirmPlayer.bind(this);
        this._updateMatch = this._updateMatch.bind(this);
        this._populatePendingPlayers = this._populatePendingPlayers.bind(this);
        this._populateConfirmedPlayers = this._populateConfirmedPlayers.bind(this);
        this._fetchMatchesDetailConfirmedPlayers = this._fetchMatchesDetailConfirmedPlayers.bind(this);
        this._fetchPlayersDetail = this._fetchPlayersDetail.bind(this);
        this._sendPushNotifications = this._sendPushNotifications.bind(this);
        this._getDevices = this._getDevices.bind(this);

        let validator = new Validator();
        validator.addCondition(new NotNullOrUndefinedCondition(esClient).throw(MatchRoutes.INVALID_ES_CLIENT));

        validator.execute(() => {
            repoMatch = new MatchRepository(esClient);
            repoMatchInvitation = new MatchInvitationRepository(esClient);
            repoPlayer = new PlayerRepository(esClient);
            repoDevices = new DeviceESRepository(esClient);
            notificationService = new NotificationService();
        }, (err) => { throw err; });
    }

    _addAllRoutes(server) {
        server.put('/match', super._bodyIsNotNull, this._createMatch, this._sendNotifications, (req, res, next) => { res.json(200, { code: 200, resp: req.match, message: 'Match created' }) });
        server.post('/match/rejectPlayer', super._bodyIsNotNull, this._getMatch, this._removePlayer, this._updateMatch, (req, res, next) => { res.json(200, { code: 200, resp: req.match, message: 'Player Removed' }) });
        server.post('/match/confirmPlayer', super._bodyIsNotNull, this._getMatch, this._confirmPlayer, this._updateMatch, (req, res, next) => { res.json(200, { code: 200, resp: req.match, message: 'Player Confirmed' }) });
        server.get('/match/upcoming', this._searchByUpcoming, this._populateConfirmedPlayers, this._populatePendingPlayers, (req, res, next) => { res.json(200, { code: 200, resp: req.matches, message: null }) });
    }

    _createMatch(req, res, next) {
        try {
            var match = new Match(req.body.title, new Date(req.body.date), req.body.fromTime, req.body.toTime, req.body.location, req.player._id, req.body.matchType);
            match.pendingPlayers = req.body.pendingPlayers.concat([req.player._id]);

            match.matchAudit = {
                createdBy: req.player._id,
                createdOn: new Date(),
                createdFrom: req.body.platform || 'MOBILE_APP',
                modifiedBy: null,
                modifiedOn: null,
                modifiedFrom: null
            }

            repoMatch.add(match)
                .then((respMatch) => {
                    return repoMatch.get(respMatch.resp._id);
                })
                .then((respMatch) => {
                    req.match = respMatch.resp;
                    next();
                });
        } catch (error) {
            res.json(400, { code: 400, message: error.message, resp: error });
        }
    }

    _searchByUpcoming(req, res, next) {
        let formatDate = moment(new Date()).format('DD/MM/YYYY');
        repoMatch.getByPlayerIdAndDate(req.player._id, formatDate)
            .then((resp) => {
                req.matches = resp.resp;
                next();
            }, (cause) => {
                res.json(400, { code: 400, message: cause, resp: null });
            })
            .catch((err) => {
                res.json(500, { code: 500, message: err, resp: null });
            });
    }

    _sendNotifications(req, res, next) {
        let notifications = this._getMatchInvitations(req.match.pendingPlayers, req.match._id, req.player._id, req.body.platform || 'MOBILE_APP');
        if (!notifications.length)
            next();
        else {
            repoMatchInvitation.addBulk(notifications)
                .then((resp) => {
                    this._sendPushNotifications(notifications);
                    next();
                }, (cause) => {
                    res.json(404, { code: 404, message: cause.message, resp: null });
                })
                .catch((err) => {
                    res.json(500, { code: 500, message: err.message, resp: null });
                });
        }
    }

    _getMatch(req, res, next) {
        repoMatch.get(req.body.matchId)
            .then((resp) => {
                if (resp.code === 404)
                    res.json(404, { code: 404, message: 'Match does not exist.', resp: null });
                else {
                    req.match = resp.resp;
                    next();
                }
            }, (cause) => {
                res.json(400, { code: 400, message: cause.message, resp: cause });
            })
            .catch((error) => {
                res.json(500, { code: 500, message: error.message, resp: error });
            })
    }

    _removePlayer(req, res, next) {
        req.match.removeInvitedPlayer(req.player._id);
        next();
    }

    _confirmPlayer(req, res, next) {
        req.match.addConfirmPlayer(req.player._id);
        next();
    }

    _updateMatch(req, res, next) {
        req.match.matchAudit = {
            createdBy: req.match.createdBy,
            createdOn: req.match.createdOn,
            createdFrom: req.match.createdFrom,
            modifiedBy: req.player._id,
            modifiedOn: new Date(),
            modifiedFrom: req.body.platform || 'MOBILE_APP'
        }

        repoMatch.update(req.match)
            .then((resp) => {
                next();
            }, (cause) => {
                res.json(400, { code: 400, message: cause.message, resp: cause });
            })
            .catch((error) => {
                res.json(500, { code: 500, message: error.message, resp: error });
            })
    }

    _getArrayFromString(stringList) {
        return stringList ? stringList.split(";") : [];
    }

    _getMatchInvitations(pendingPlayers, matchId, senderId, platform) {
        let notifications = [];

        for (let i = 0; i < pendingPlayers.length; i++) {
            if (pendingPlayers[i] !== senderId) {
                let newNotification = new MatchInvitation(matchId, pendingPlayers[i], senderId, 'PENDING', new Date());
                newNotification.matchInvitationAudit = {
                    createdBy: senderId, //We should store deviceId here
                    createdOn: new Date(),
                    createdFrom: platform,
                    modifiedBy: null,
                    modifiedOn: null,
                    modifiedFrom: null
                }
                notifications.push(newNotification);
            }
        }

        return notifications;
    }

    _populatePendingPlayers(req, res, next) {
        this._fetchMatchesDetailPendingPlayers(req.matches, 0)
            .then((ret) => {
                req.matches = ret;
                next();
            }, (cause) => {
                res.json(400, { code: 400, message: cause, resp: null });
            })
            .catch((error) => {
                res.json(500, { code: 500, message: cause, resp: null });
            });
    }

    _populateConfirmedPlayers(req, res, next) {
        this._fetchMatchesDetailConfirmedPlayers(req.matches, 0)
            .then((ret) => {
                req.matches = ret;
                next();
            }, (cause) => {
                res.json(400, { code: 400, message: cause, resp: null });
            })
            .catch((error) => {
                res.json(500, { code: 500, message: error, resp: null });
            });
    }

    _fetchMatchesDetailConfirmedPlayers(arr, pos) {
        return new Promise((resolve, reject) => {
            if (arr.length == pos)
                resolve(arr);
            else {
                return this._fetchPlayersDetail(arr[pos].confirmedPlayers, 0)
                    .then((retPlayers) => {
                        arr[pos].confirmedPlayers = retPlayers;
                        return this._fetchMatchesDetailConfirmedPlayers(arr, ++pos)
                            .then((retMatch) => resolve(retMatch))
                    });
            }
        });
    }

    _fetchMatchesDetailPendingPlayers(arr, pos) {
        return new Promise((resolve, reject) => {
            if (arr.length == pos)
                resolve(arr);
            else {
                return this._fetchPlayersDetail(arr[pos].pendingPlayers, 0)
                    .then((retPlayers) => {
                        arr[pos].pendingPlayers = retPlayers;
                        return this._fetchMatchesDetailPendingPlayers(arr, ++pos)
                            .then((retMatch) => resolve(retMatch))
                    });
            }
        });
    }

    _fetchPlayersDetail(arr, pos) {
        return new Promise((resolve, reject) => {
            if (arr.length == pos)
                resolve(arr);
            else {
                repoPlayer.get(arr[pos])
                    .then((response) => {
                        arr[pos] = response.resp;
                        arr[pos].playerAudit = undefined;

                        return this._fetchPlayersDetail(arr, ++pos)
                            .then((ret) => resolve(ret));
                    });
            }
        });
    }

    _sendPushNotifications(notifications) {
        if (notifications.length) {
            let players = [];
            for (let i = 0; i < notifications.length; i++) {
                players.push(notifications[i].playerId);
            }

            try {
                this._fetchPlayersDetail(players, 0)
                    .then((retPlayers) => {
                        let users = [];
                        for (let i = 0; i < retPlayers.length; i++) {
                            users.push(retPlayers[i].userid);
                        }

                        return this._getDevices(users, 0)
                            .then((devices) => {
                                let pushNotification = new PushNotification(PushNotificationType.INVITED_TO_MATCH, notifications[0].matchId);
                                notificationService.push(devices, pushNotification);
                            });
                    });
            } catch (error) {

            }
        }
    }

    _getDevices(arr, pos) {
        return new Promise((resolve, reject) => {
            if (arr.length == pos)
                resolve(arr);
            else {
                repoDevices.getByUserId(arr[pos])
                    .then((response) => {
                        arr[pos] = response.resp;
                        arr[pos].deviceAudit = undefined;

                        return this._getDevices(arr, ++pos)
                            .then((ret) => resolve(ret));
                    });
            }
        });
    }

    static get INVALID_ES_CLIENT() {
        return 'El cliente de ElasticSearch no puede ser null ni undefined';
    }
}

module.exports = MatchRoutes;