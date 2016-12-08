'use strict'
var MatchComment = require('./MatchComment');
var Validator = require('no-if-validator').Validator;
var NotNullOrUndefinedCondition = require('no-if-validator').NotNullOrUndefinedCondition;
var InstanceOfCondition = require('no-if-validator').InstanceOfCondition;
var CustomCondition = require('no-if-validator').CustomCondition;
var IsNumberCondition = require('no-if-validator').IsNumberCondition;

class Match {
    constructor(title, date, fromTime, toTime, location, creator, matchType) {
        this._existsInPendingPlayers = this._existsInPendingPlayers.bind(this);
        this._existsInConfirmedPlayers = this._existsInConfirmedPlayers.bind(this);

        var validator = new Validator();
        validator.addCondition(new NotNullOrUndefinedCondition(title).throw(new Error(Match.INVALID_TITLE)));
        validator.addCondition(new NotNullOrUndefinedCondition(date).throw(new Error(Match.INVALID_DATE)));
        validator.addCondition(new NotNullOrUndefinedCondition(fromTime).throw(new Error(Match.INVALID_TIME)));
        validator.addCondition(new CustomCondition(() => {
            var regex = /([01]\d|2[0-3]):([0-5]\d)/;
            return regex.test(fromTime)
        }).throw(new Error(Match.INVALID_TIME_FORMAT)));
        validator.addCondition(new NotNullOrUndefinedCondition(toTime).throw(new Error(Match.INVALID_TIME)));
        validator.addCondition(new CustomCondition(() => {
            var regex = /([01]\d|2[0-3]):([0-5]\d)/;
            return regex.test(toTime)
        }).throw(new Error(Match.INVALID_TIME_FORMAT)));
        validator.addCondition(new NotNullOrUndefinedCondition(location).throw(new Error(Match.INVALID_LOCATION)));
        validator.addCondition(new NotNullOrUndefinedCondition(creator).throw(new Error(Match.INVALID_CREATOR)));
        validator.addCondition(new InstanceOfCondition(date, Date).throw(new Error(Match.INVALID_DATE_TYPE)));
        validator.addCondition(new NotNullOrUndefinedCondition(matchType).throw(new Error(Match.INVALID_MATCH_TYPE)));

        validator.execute(() => {
            this.title = title;
            this.date = date;
            this.fromTime = fromTime;
            this.toTime = toTime;
            this.location = location;
            this.creator = creator;
            this.matchType = matchType;
            this.confirmedPlayers = [];
            this.pendingPlayers = [];
            this.comments = [];
        }, (err) => { throw err; });
    }

    addInvitedPlayer(playerId) {
        // add to pending players
        // this players have been invited but they are not confirmed yet
        if (!this._existsInPendingPlayers(playerId)) {
            this.pendingPlayers.push(playerId)
        }
    }

    removeInvitedPlayer(playerId) {
        var position = this.pendingPlayers.indexOf(playerId);
        if (position > -1) {
            this.pendingPlayers.splice(position, 1);
        }
    }

    addConfirmPlayer(playerId) {
        if (!this._existsInConfirmedPlayers(playerId)) {
            this.confirmedPlayers.push(playerId);
            this.removeInvitedPlayer(playerId);
        }
    }

    removeConfirmPlayer(playerId) {
        // this player is confirmed and it is going to be remove from de match
    }

    addComment(owner, text, writtenOn) {
        this.comments.push(new MatchComment(this._getNewCommentId(), owner, text, writtenOn));
    }

    updateComment(id, newText) {
        var indexToUpdate = null;
        for (var i = 0; i < this.comments.length; i++) {
            if (this.comments[i].id == id) {
                indexToUpdate = i;
            }
        }
        if (indexToUpdate != null) {
            var commentToUpdate = this.comments[indexToUpdate];
            commentToUpdate.text = newText;

            this.removeComment(commentToUpdate.id);
            this.comments.push(commentToUpdate);
        }
    }

    removeComment(id) {
        var indexToRemove = null;
        for (var i = 0; i < this.comments.length; i++) {
            if (this.comments[i].id == id) {
                indexToRemove = i;
            }
        }

        if (indexToRemove != null)
            this.comments.splice(indexToRemove, 1);
    }

    _getNewCommentId() {
        var newId = 0

        for (var i = 0; i < this.comments.length; i++) {
            if (this.comments[i].id > newId) {
                newId = this.comments[i].id;
            }
        }

        return newId + 1;
    }

    _existsInPendingPlayers(playerId) {
        for (var i = 0; i < this.pendingPlayers.length; i++) {
            if (this.pendingPlayers[i] == playerId)
                return true

            return false;
        }
    }

    _existsInConfirmedPlayers(playerId) {
        for (var i = 0; i < this.confirmedPlayers.length; i++) {
            if (this.confirmedPlayers[i] == playerId)
                return true

            return false;
        }
    }

    static INVALID_DATE() {
        return 'La fecha no debe ser invalida.';
    }
    static INVALID_TIME() {
        return 'La hora no debe ser invalida.';
    }
    static INVALID_TIME_FORMAT() {
        return 'El formato de la hora es inválido.';
    }
    static INVALID_LOCATION() {
        return 'La ubicación no debe ser invalida.';
    }
    static INVALID_CREATOR() {
        return 'El creador es inválido.';
    }
    static INVALID_CREATOR_TYPE() {
        return 'El creador debe ser del tipo Number.';
    }
    static INVALID_PLAYER() {
        return 'El jugardor es inválido.'
    }
    static INVALID_TITLE() {
        return 'El título no puede ser nulo o indefinido.';
    }
    static INVALID_DATE_TYPE() {
        return 'La fecha debe ser del tipo Date.'
    }
    static INVALID_MATCH_TYPE() {
        return 'El tipo de partido no puede ser nulo o indefinido.';
    }
}

module.exports = Match;