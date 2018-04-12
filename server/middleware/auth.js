'use strict';
const rp = require('request-promise');
const secrets = require('../config/secrets');

module.exports.isAuthenticated = function () {
    return async function (req, res, next) {

        if (!req.user || !req.user.token) return res.redirect(req.redirect.auth);

        try {

            const isValid = await rp({
                method: 'GET',
                uri: secrets.auth.host + 'verify/' + req.user.token
            })

            if (isValid) return next();

        } catch (err) {
            res.redirect(req.redirect.auth);
        }

    }
};

module.exports.isUnauthenticated = function () {
    return async function (req, res, next) {

        if (!req.user || !req.user.token) return next();

        try {

            const isValid = await rp({
                method: 'GET',
                uri: secrets.auth.host + 'verify/' + req.user.token
            })

            if (!isValid) return next();

        } catch (err) {
            return next();
        }

        res.redirect(req.redirect.auth);

    }
};