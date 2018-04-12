const path = require('path')
const rootPath = path.normalize(__dirname + '/../..')
const env = process.env.NODE_ENV || 'development'

const config = {
    development: {
        root: rootPath,
        db: {
            options: {
                reconnectInterval: 500,
                reconnectTries: 50,
                useMongoClient: true,
                poolSize: 5
            }
        },
        sessionStore: {
            port: process.env.REDIS_PORT || 6379,
            db: 0,
            logErrors: true,
            // ttl: 0
        },
        // Options for express session
        session: {
            resave: false,
            saveUninitialized: false,
            rolling: true,
            cookie: {
                secure: false,
                maxAge: 1000 * 60 * 15
            }
        }
    },

    test: {
        root: rootPath,
        db: {
            options: {
                reconnectInterval: 500,
                reconnectTries: 50,
                useMongoClient: true,
                poolSize: 5
            }
        },
        // Options for express session
        session: {
            resave: false,
            saveUninitialized: false,
            rolling: true,
            cookie: {
                secure: false,
                maxAge: 1000 * 60 * 15
            }
        },
        sessionStore: {
            port: 6379,
            db: 0,
            logErrors: true
        }
    },

    production: {
        root: rootPath,
        db: {
            options: {
                reconnectInterval: 500,
                reconnectTries: 50,
                useMongoClient: true,
                poolSize: 5
            }
        },
        sessionStore: {
            port: process.env.REDIS_PORT || 6379,
            db: 0,
            logErrors: true,
            ttl: 0
        },
        // Options for express session
        session: {
            resave: false,
            saveUninitialized: false,
            rolling: true,
            cookie: {
                secure: true,
                maxAge: 1000 * 60 * 15
            }
        }
    },

    stage: {
        root: rootPath,
        db: {
            options: {
                reconnectInterval: 500,
                reconnectTries: 50,
                useMongoClient: true,
                poolSize: 5
            }
        },
        sessionStore: {
            port: process.env.REDIS_PORT || 6379,
            db: 0,
            logErrors: true,
            // ttl: 0
        },
        // Options for express session
        session: {
            resave: false,
            saveUninitialized: false,
            rolling: true,
            cookie: {
                secure: true,
                maxAge: 1000 * 60 * 15
            }
        }
    }
}

module.exports = config[env]
