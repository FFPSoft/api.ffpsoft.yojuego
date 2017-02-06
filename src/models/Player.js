'use strict'
var Validator = require('no-if-validator').Validator;
var NotNullOrUndefinedCondition = require('no-if-validator').NotNullOrUndefinedCondition;

class Player {
    constructor(firstName, lastName, nickName, userid, email, photo, phone, auditInfo) {
        var validator = new Validator();
        validator.addCondition(new NotNullOrUndefinedCondition(firstName).throw(new Error(Player.INVALID_FIRSTNAME)));
        validator.addCondition(new NotNullOrUndefinedCondition(lastName).throw(new Error(Player.INVALID_LASTNAME)));
        validator.addCondition(new NotNullOrUndefinedCondition(userid).throw(new Error(Player.INVALID_USERID)));

        validator.execute(() => {
            this.firstName = firstName;
            this.lastName = lastName;
            this.nickName = nickName;
            this.email = email;
            this.photo = photo;
            this.phone = phone;
            this.userid = userid;
            this.audit = auditInfo;
        }, (err) => { throw err; });
    }

    static get INVALID_FIRSTNAME() {
        return 'El nombre no puede nulo o indefinido.';
    }

    static get INVALID_LASTNAME() {
        return 'El apellido no puede nulo o indefinido.';
    }

    static get INVALID_USERID() {
        return 'El userID no puede nulo o indefinido.';
    }
}

module.exports = Player;