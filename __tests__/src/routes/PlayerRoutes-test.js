import PlayerRoutes from '../../../src/routes/PlayerRoutes';

describe('PlayerRoutes', () => {
    it('Can add all routes', () => {
        let serverMocked = {
            get: jest.fn((url, callback) => { }),
            post: jest.fn((url, callback) => { }),
            delete: jest.fn((url, callback) => { })
        };
        let playerRoutes = new PlayerRoutes();
        playerRoutes.add(serverMocked)

        expect(serverMocked.get.mock.calls.length).toEqual(2);
        expect(serverMocked.post.mock.calls.length).toEqual(2);
        expect(serverMocked.delete.mock.calls.length).toEqual(1);
        expect(serverMocked.get.mock.calls[0][0]).toEqual('/player/:id/profile');
        expect(serverMocked.get.mock.calls[1][0]).toEqual('/player/:id/upcomingMatches');
        expect(serverMocked.post.mock.calls[0][0]).toEqual('/player/create');
        expect(serverMocked.post.mock.calls[1][0]).toEqual('/player/:id/update');
        expect(serverMocked.delete.mock.calls[0][0]).toEqual('/player/:id');
    });
});