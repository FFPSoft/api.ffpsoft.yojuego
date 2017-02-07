'use strict'
var UserType = require('../constants/UserType');
var User = require('./User');

class GoogleUser extends User {
    constructor(id, auditInfo) {
        super(UserType.google, id);
    }
}

module.exports = GoogleUser;