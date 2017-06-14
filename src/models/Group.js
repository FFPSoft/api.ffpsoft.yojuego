let Validator = require('no-if-validator').Validator;
// let NotNullOrUndefinedCondition = require('no-if-validator').NotNullOrUndefinedCondition;
// let EqualCondition = require('no-if-validator').EqualCondition;

class Group {
    constructor(players, admins, description, photo) {
        let validator = new Validator();

        this.addPlayer = this.addPlayer.bind(this);
        this.makeAdmin = this.makeAdmin.bind(this);
        this.removePlayer = this.removePlayer.bind(this);
        this.isAdmin = this.isAdmin.bind(this);
        this._removePlayer = this._removePlayer.bind(this);
        this._removeAdmin = this._removeAdmin.bind(this);
        this._existsInPlayers = this._existsInPlayers.bind(this);
        this._existsInAdmins = this._existsInAdmins.bind(this);

        validator.execute(() => {
            this.players = players;
            this.admins = admins;
            this.description = description;
            this.photo = photo;
        }, (err) => { throw err; });
    }

    addPlayer(adminId, playerId) {
        if (!this._existsInAdmins(adminId))
            throw new Exception(Group.ACTION_REQUIRE_ADMIN);

        if (!this._existsInPlayers(playerId))
            this.players.push(playerId);

        this._removeAdmin(playerId);
    }

    makeAdmin(adminId, playerId) {
        if (!this._existsInAdmins(adminId))
            throw new Exception(Group.ACTION_REQUIRE_ADMIN);

        if (!this._existsInAdmins(playerId))
            this.admins.push(playerId);
    }

    removePlayer(adminId, playerId) {
        if (!this._existsInAdmins(adminId))
            throw new Exception(Group.ACTION_REQUIRE_ADMIN);

        this._removePlayer(playerId);
        this._removeAdmin(playerId);
    }

    isAdmin(playerId) {
        return this._existsInAdmins(playerId);
    }

    isMember(playerId) {
        return this._existsInAdmins(playerId) || this._existsInPlayers(playerId);
    }

    _removePlayer(playerId) {
        var position = this.players.indexOf(playerId);
        if (position > -1)
            this.players.splice(position, 1);
    }

    _removeAdmin(adminId) {
        var position = this.admins.indexOf(adminId);
        if (position > -1)
            this.admins.splice(position, 1);
    }

    _existsInPlayers(playerId) {
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i] == playerId)
                return true
        }
        return false;
    }

    _existsInAdmins(playerId) {
        for (var i = 0; i < this.admins.length; i++) {
            if (this.admins[i] == playerId)
                return true
        }
        return false;
    }

    static get ACTION_REQUIRE_ADMIN() { return 'La accion require ser ejecutada por un administrador del grupo.'; }

}

module.exports = Group;