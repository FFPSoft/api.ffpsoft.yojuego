module.exports = {
    facebook: {
        appId: '1278813425492876',
        appSecret: '9c4337094d1d9b3f732396f3540b15d5',
        callback: 'http://localhost:8080/signup/facebook/callback'
    },
    'secret': 'tmenos3-revolutioningtheinovation',
    'database': 'http://localhost:9200',
    'expiresIn': 3600, //Time in seconds
    'port': 8080,
    'pathsWithoutAuthentication': ['/', 
                                   '/signup/facebook/callback', 
                                   '/signup/google/callback',
                                   '/signup/local',
                                   '/signup/facebook',
                                   '/signup/google',
                                   '/logIn/facebook/callback',
                                   '/logIn/google/callback',
                                   '/logIn/local',
                                   '/logIn/facebook',
                                   '/logIn/google']
};