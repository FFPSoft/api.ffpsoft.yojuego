import AuthRoutes from '../../../src/routes/AuthRoutes';
jest.mock('passport-facebook', () => {
    return {
        Strategy: jest.fn((params, callback) => {
            return {
                clientID: params.clientID,
                clientSecret: params.clientSecret,
                callbackURL: params.callbackURL,
            };
        })
    }
});
jest.mock('elasticsearch', () => {
    return {
        Client: jest.fn((params) => {
            return {
                search: jest.fn((criteria, callback) => { })
            }
        })
    }
});
jest.mock('../../../src/repositories/PlayerESRepository', () => {
    return jest.fn((client) => {
        return {
            getBy: jest.fn((criteria) => {
                return new Promise((resolve, reject) => {
                    resolve([{ account: { mail: 'anyMail' } }]);
                });
            })
        }
    })

});

describe('AuthRoutes', () => {
    let config = require('../../../config');
    let serverMocked;
    let passportMocked;

    beforeEach(() => {
        serverMocked = {
            get: jest.fn((url, callback) => { }),
            post: jest.fn((url, callback) => { }),
            use: jest.fn((obj) => { })
        };

        passportMocked = {
            serializeUser: jest.fn((callback) => { }),
            authenticate: jest.fn((type) => { return jest.fn((req, res, next) => { }); }),
            use: jest.fn((strategy, callback) => { })
        }
    });

    afterEach(() => {
        serverMocked = null;
        passportMocked = null;
    });

    it('Cannot add routes with an undefined server', () => {
        let undefinedServer;
        let routes = new AuthRoutes();

        expect(() => routes.add(undefinedServer)).toThrowError(AuthRoutes.INVALID_SERVER);
    });

    it('Cannot add routes with an null server', () => {
        let nullServer = null;
        let routes = new AuthRoutes();

        expect(() => routes.add(nullServer)).toThrowError(AuthRoutes.INVALID_SERVER);
    });

    it('Cannot add routes with an undefined passport', () => {
        let undefinedPassport;
        let routes = new AuthRoutes();

        expect(() => routes.add({}, undefinedPassport)).toThrowError(AuthRoutes.INVALID_PASSPORT);
    });

    it('Cannot add routes with an null passport', () => {
        let nullPassport = null;
        let routes = new AuthRoutes();

        expect(() => routes.add({}, nullPassport)).toThrowError(AuthRoutes.INVALID_PASSPORT);
    });

    it('Before add routes it must configure passport', () => {
        let authRoutes = new AuthRoutes();
        authRoutes.add(serverMocked, passportMocked);

        expect(passportMocked.use.mock.calls.length).toEqual(1);
        expect(passportMocked.use.mock.calls[0][0]).toEqual('facebook');
        expect(passportMocked.use.mock.calls[0][1].clientID).toEqual(config.facebook.appId);
        expect(passportMocked.use.mock.calls[0][1].clientSecret).toEqual(config.facebook.appSecret);
        expect(passportMocked.use.mock.calls[0][1].callbackURL).toEqual(config.facebook.callback);
    });

    it('Can add all routes', () => {
        let authRoutes = new AuthRoutes();
        authRoutes.add(serverMocked, passportMocked);

        expect(serverMocked.get.mock.calls.length).toEqual(4);
        expect(serverMocked.get.mock.calls[0][0]).toEqual('/auth/facebook/callback');
        expect(serverMocked.get.mock.calls[1][0]).toEqual('/auth/google/callback');
        expect(serverMocked.get.mock.calls[2][0]).toEqual('/auth/facebook');
        expect(serverMocked.get.mock.calls[3][0]).toEqual('/auth/google');
    });
});