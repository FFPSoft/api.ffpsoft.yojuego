var Validator = require('no-if-validator').Validator;
var NotNullOrUndefinedCondition = require('no-if-validator').NotNullOrUndefinedCondition;
var config = require('../../config');
var UserESRepository = require('../repositories/UserESRepository');
var YoJuegoUser = require('../models/YoJuegoUser');
var FacebookUser = require('../models/FacebookUser');
var GoogleUser = require('../models/GoogleUser');
var jwt = require('jsonwebtoken');
var es = require('elasticsearch');
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuthStrategy;
var LocalStrategy = require('passport-local').Strategy;
var client = new es.Client({
    host: config.database,
    log: 'info'
});

var getNewUser = (info) => {
    switch (info.type) {
        case 'yojuego':
            return new YoJuegoUser(info.userid, info.password);
        case 'facebook':
            return new FacebookUser(info.userid);
        case 'google':
            return new GoogleUser(info.userid);
    }
}
var repo = new UserESRepository(client);

class SignUpRoutes {
    constructor() { }

    add(server, passport) {
        let validator = new Validator();
        validator.addCondition(new NotNullOrUndefinedCondition(server).throw(SignUpRoutes.INVALID_SERVER));
        validator.addCondition(new NotNullOrUndefinedCondition(passport).throw(SignUpRoutes.INVALID_PASSPORT));

        validator.execute(() => this._addAllRoutes(server, passport), (err) => { throw err; });
    }

    _addAllRoutes(server, passport) {
        this._configurePassport(server, passport);

        server.get('/signup/facebook',
            passport.authenticate('facebook-signup', { session: false, scope: ['public_profile', 'user_birthday', 'email'] })
        );

        server.get('/signup/facebook/callback',
            passport.authenticate('facebook-signup', { session: false }),
            this._createUser,
            this._generateToken,
            (req, res, next) => {
                res.redirect('/signup/facebook/success/token=' + req.token, next);
            }
        );

        server.get('/signup/yojuego',
            passport.authenticate('yojuego-signup'),
            this._createUser,
            this._generateToken,
            (req, res, next) => { res.json(200, { token: req.token }); }
        );

        server.get('/signup/google',
            passport.authenticate('google-signup', { scope: 'https://www.google.com/m8/feeds' })
        );

        // No sé si cuando falla estaría bien el redirect (failureRedirect: '/login')
        server.get('/signup/google/callback',
            passport.authenticate('google-signup', { failureRedirect: '/login' }),
            this._createUser,
            this._generateToken,
            (req, res, next) => {
                res.redirect('/signup/google/success/token=' + req.token, next);
            }
        );
    }

    _signUpYoJuego(req, email, password, done) {
        //repo.getbyUserId(profile.id, 'yojuego')
        repo.getBy({
            "bool": {
                "must": [
                    { "term": { "userid": email } },
                    { "term": { "type": "yojuego" } }
                ]
            }
        })
            .then((result) => {
                if (result.length > 0) {
                    req.statusCode = 400;
                    req.statusMessage = 'La cuenta está en uso';
                    return done({ code: 400, message: 'La cuenta está en uso' }, null);
                } else {
                    var newUser = {
                        type: 'yojuego',
                        userid: email,
                        password: password
                    };
                    req.newUser = newUser;
                    return done(null, newUser);
                }
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

    _signUpFacebook(req, token, refreshToken, profile, done) {
        //repo.getbyUserId(profile.id, 'facebook')
        repo.getBy({
            "bool": {
                "must": [
                    { "term": { "userid": profile.id } },
                    { "term": { "type": "facebook" } }
                ]
            }
        })
            .then((result) => {
                if (result.length > 0) {
                    req.statusCode = 400;
                    req.statusMessage = 'La cuenta está en uso';
                    return done({ code: 400, message: 'La cuenta está en uso' }, null);
                } else {
                    let newUser = {
                        userid: profile.id,
                        type: 'facebook'
                    }
                    req.newUser = newUser;
                    return done(null, profile);
                }
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

    _signUpGoogle(req, token, refreshToken, profile, done) {
        repo.getBy({
            "bool": {
                "must": [
                    { "term": { "userid": profile.id } },
                    { "term": { "type": 'google' } }
                ]
            }
        })
            .then((result) => {
                if (result.length > 0) {
                    req.statusCode = 400;
                    req.statusMessage = 'La cuenta está en uso';
                    return done({ code: 400, message: 'La cuenta está en uso' }, null);
                } else {
                    let newUser = {
                        userid: profile.id,
                        type: 'google'
                    }
                    req.newUser = newUser;
                    return done(null, profile);
                }
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
        if (req.statusCode !== undefined && req.statusCode !== null) {
            res.json(req.statusCode, req.statusMessage);
        } else {
            let newUser = getNewUser(req.newUser);
            repo.add(newUser)
                .then((resp) => {
                    req.user = newUser;
                    next();
                }, (err) => { res.json(400, err); });
        }
    }

    _generateToken(req, res, next) {
        req.token = jwt.sign(req.user.userid, config.secret);
        next();
    }

    _configurePassport(server, passport) {
        passport.use('facebook-signup', new FacebookStrategy({
            clientID: config.facebook.appId,
            clientSecret: config.facebook.appSecret,
            callbackURL: config.facebook.callback,
            profileFields: ['id', 'birthday', 'displayName', 'picture.type(large)', 'email'],
            passReqToCallback: true
        }, this._signUpFacebook));

        passport.use('google-signup', new GoogleStrategy({
            clientID: config.google.appId,
            clientSecret: config.google.appSecret,
            callbackURL: config.google.callback,
            profileFields: ['id', 'birthday', 'displayName', 'picture.type(large)', 'email'],
            passReqToCallback: true
        }, this._signUpGoogle));

        passport.use('yojuego-signup', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        }, this._signUpYoJuego));
    }

    static get INVALID_PASSPORT() {
        return 'Invalid passport';
    }

    static get INVALID_SERVER() {
        return 'El server no puede ser null ni undefined';
    }
}

module.exports = SignUpRoutes;