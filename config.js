module.exports = {
    facebook: {
        appId: '289976541370822',
        appSecret: 'c619851f38a6d9bfb1d6d2a208ee6bc0',
        callback: 'http://ec2-54-174-177-82.compute-1.amazonaws.com:8081/auth/facebook/callback'
    },
    'secret': 'tmenos3-revolutioningtheinovation',
    'database': 'https://search-yojuegoes-cb2mgiednpd4tf5epwebnbszfe.us-east-1.es.amazonaws.com/',
    'expiresIn': null, //Time in seconds
    'port': 8081,
    'pathsWithoutAuthentication': ['/',
        '/echo',
        '/signup/yojuego',
        '/login/yojuego',
        '/auth/facebook/callback',
        '/auth/google/callback',
        '/auth/facebook',
        '/auth/google']
};