var Validator = require('no-if-validator').Validator;
var NotNullOrUndefinedCondition = require('no-if-validator').NotNullOrUndefinedCondition;
var config = require('config');
var UserESRepository = require('../repositories/UserESRepository');
var PlayerESRepository = require('../repositories/PlayerESRepository');
var FacebookUser = require('../models/FacebookUser');
var GoogleUser = require('../models/GoogleUser');
var FacebookStrategy = require('passport-facebook').Strategy
var GoogleStrategy = require('passport-google-oauth20').Strategy;

var repoUser = null;
var repoPlayer = null;
var jwt = null;

class AuthRoutes {
    constructor(esClient, jwtParam) {
        this._addAllRoutes = this._addAllRoutes.bind(this);
        this._authFacebook = this._authFacebook.bind(this);
        this._authGoogle = this._authGoogle.bind(this);
        this._createUser = this._createUser.bind(this);
        this._generateToken = this._generateToken.bind(this);
        this._configurePassport = this._configurePassport.bind(this);
        this._getNewUser = this._getNewUser.bind(this);

        let validator = new Validator();
        validator.addCondition(new NotNullOrUndefinedCondition(esClient).throw(AuthRoutes.INVALID_ES_CLIENT));
        validator.addCondition(new NotNullOrUndefinedCondition(jwtParam).throw(AuthRoutes.INVALID_JWT));
        validator.execute(() => {
            repoUser = new UserESRepository(esClient);
            repoPlayer = new PlayerESRepository(esClient);
            jwt = jwtParam;
        }, (err) => { throw err; });
    }

    add(server, passport) {
        let validator = new Validator();
        validator.addCondition(new NotNullOrUndefinedCondition(server).throw(AuthRoutes.INVALID_SERVER));
        validator.addCondition(new NotNullOrUndefinedCondition(passport).throw(AuthRoutes.INVALID_PASSPORT));

        validator.execute(() => this._addAllRoutes(server, passport), (err) => { throw err; });
    }

    _addAllRoutes(server, passport) {
        this._configurePassport(server, passport);

        server.get('/auth/facebook', passport.authenticate('facebook', { session: false, scope: ['public_profile', 'user_birthday', 'email'] }));
        server.get('/auth/google', passport.authenticate('google', { session: false, scope: ['profile'] }));
        server.get('/auth/facebook/callback', passport.authenticate('facebook', { session: false }), this._createUser, this._generateToken, (req, res, next) => {
            res.redirect('/auth/success?token=' + req.token, next);
        });
        server.get('/auth/google/callback', passport.authenticate('google', { session: false }), this._createUser, this._generateToken, (req, res, next) => {
            res.redirect('/auth/success?token=' + req.token, next);
        });
    }

    _authFacebook(req, token, refreshToken, profile, done) {
        repoUser.getByIdAndType(profile.id, 'facebook')
            .then((response) => {
                if (response.resp) {
                    req.exists = true;
                    req.user = response.resp;
                } else {
                    req.newUser = {
                        id: profile.id,
                        type: 'facebook'
                    };
                }
                return done(null, profile);
            }, (err) => {
                req.statusCode = 400;
                req.statusMessage = err;
                return done({ code: 400, message: err }, null);
            })
            .catch((err) => {
                req.statusCode = 400;
                req.statusMessage = err;
                return done({ code: 500, message: err }, null);
            });
    }

    _authGoogle(req, token, refreshToken, profile, done) {
        repoUser.getByIdAndType(profile.id, 'google')
            .then((result) => {
                if (result.resp) {
                    req.exists = true;
                    req.user = result.resp;
                } else {
                    req.newUser = {
                        id: profile.id,
                        type: 'google'
                    };
                }
                return done(null, profile);
            }, (err) => {
                req.statusCode = 400;
                req.statusMessage = err;
                return done({ code: 400, message: err }, null);
            })
            .catch((err) => {
                req.statusCode = 400;
                req.statusMessage = err;
                return done({ code: 500, message: err }, null);
            });
    }

    _createUser(req, res, next) {
        if (req.exists) {
            next();
        } else {
            let newUser = this._getNewUser(req.newUser);
            repoUser.add(newUser)
                .then((resp) => {
                    req.user = newUser;
                    next();
                }, (err) => { res.json(400, err); });
        }
    }

    _generateToken(req, res, next) {
        req.token = jwt.sign(req.user.id, config.get('serverConfig').secret);
        next();
    }

    _configurePassport(server, passport) {
        passport.use('facebook', new FacebookStrategy({
            clientID: config.get('auth').facebook.appId,
            clientSecret: config.get('auth').facebook.appSecret,
            callbackURL: config.get('auth').facebook.callback,
            profileFields: ['id', 'birthday', 'displayName', 'picture.type(large)', 'email'],
            passReqToCallback: true
        }, this._authFacebook));

        passport.use('google', new GoogleStrategy({
            clientID: config.get('auth').google.appId,
            clientSecret: config.get('auth').google.appSecret,
            callbackURL: config.get('auth').google.callback,
            passReqToCallback: true
        }, this._authGoogle));
    }

    _getNewUser(info) {
        switch (info.type) {
            case 'facebook':
                return new FacebookUser(info.id);
            case 'google':
                return new GoogleUser(info.id);
        }
    }

    static get INVALID_PASSPORT() {
        return 'Invalid passport';
    }

    static get INVALID_SERVER() {
        return 'El server no puede ser null ni undefined';
    }

    static get INVALID_JWT() {
        return 'El jwt no puede ser null ni undefined';
    }

    static get INVALID_ES_CLIENT() {
        return 'El cliente de ElasticSearch no puede ser null ni undefined';
    }
}

module.exports = AuthRoutes;