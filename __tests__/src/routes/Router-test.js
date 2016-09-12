import Router from '../../../src/routes/Router';

describe('Router', () => {
    it('Can add all routes', () => {
        let serverMocked = {
            get: jest.fn((url, callback) => { }),
            post: jest.fn((url, callback) => { }),
            del: jest.fn((url, callback) => { })
        };
        let passportMocked = {
            use: jest.fn((strategy, callback) => { }),
            authenticate: jest.fn((strategy, callback) => { })
        }
        let router = new Router();
        router.addAll(serverMocked, passportMocked);

        expect(serverMocked.get.mock.calls.length).toEqual(15);
        expect(serverMocked.post.mock.calls.length).toEqual(6);
        expect(serverMocked.del.mock.calls.length).toEqual(3);

        expect(serverMocked.get.mock.calls[0][0]).toEqual('/invitation/:id');
        expect(serverMocked.get.mock.calls[1][0]).toEqual('/login/facebook/callback');
        expect(serverMocked.get.mock.calls[2][0]).toEqual('/login/google/callback');
        expect(serverMocked.get.mock.calls[3][0]).toEqual('/login/yojuego');
        expect(serverMocked.get.mock.calls[4][0]).toEqual('/login/facebook');
        expect(serverMocked.get.mock.calls[5][0]).toEqual('/login/google');
        expect(serverMocked.get.mock.calls[6][0]).toEqual('/match/:id');
        expect(serverMocked.get.mock.calls[7][0]).toEqual('/match/:id/invitations');
        expect(serverMocked.get.mock.calls[8][0]).toEqual('/player/:id/profile');
        expect(serverMocked.get.mock.calls[9][0]).toEqual('/player/:id/upcomingMatches');
        expect(serverMocked.get.mock.calls[10][0]).toEqual('/signup/facebook/callback');
        expect(serverMocked.get.mock.calls[11][0]).toEqual('/signup/google/callback');
        expect(serverMocked.get.mock.calls[12][0]).toEqual('/signup/yojuego');
        expect(serverMocked.get.mock.calls[13][0]).toEqual('/signup/facebook');
        expect(serverMocked.get.mock.calls[14][0]).toEqual('/signup/google');

        expect(serverMocked.post.mock.calls[0][0]).toEqual('/invitation/:id/accept');
        expect(serverMocked.post.mock.calls[1][0]).toEqual('/invitation/:id/reject');
        expect(serverMocked.post.mock.calls[2][0]).toEqual('/match/:id/addInvitation');
        expect(serverMocked.post.mock.calls[3][0]).toEqual('/match/:id/removeInvitation');
        expect(serverMocked.post.mock.calls[4][0]).toEqual('/player/create');
        expect(serverMocked.post.mock.calls[5][0]).toEqual('/player/:id/update');

        expect(serverMocked.del.mock.calls[0][0]).toEqual('/invitation/:id');
        expect(serverMocked.del.mock.calls[1][0]).toEqual('/match/:id');
        expect(serverMocked.del.mock.calls[2][0]).toEqual('/player/:id');
    });
});