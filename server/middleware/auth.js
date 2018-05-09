"use strict";
const rp = require("request-promise");
const secrets = require("../config/secrets");

module.exports.isAuthenticated = function() {
  return async function(req, res, next) {
    if (!req.user || !req.user.token) return res.redirect(req.redirect.auth);

    try {
      const user = await rp({
        method: "GET",
        uri: secrets.auth.host + "api/v1/auth/whoami",
        headers: {
          authorization: "Bearer " + req.user.token
        },
        json: true
      });

      if (user.token) {
        req.session.passport.user.token = user.token;
        // console.log(
        //   "req.session.passport.user.token =>",
        //   req.session.passport.user.token
        // );
        return next();
      } else {
        res.redirect(req.redirect.auth);
      }
    } catch (err) {
      res.redirect(req.redirect.auth);
    }
  };
};

module.exports.isUnauthenticated = function() {
  return async function(req, res, next) {
    if (!req.user || !req.user.token) return next();

    try {
      const user = await rp({
        method: "GET",
        uri: secrets.auth.host + "api/v1/auth/whoami",
        headers: {
          authorization: "Bearer " + req.user.token
        },
        json: true
      });

      if (!user.token) {
        return next();
      }
    } catch (err) {
      return next();
    }

    res.redirect(req.redirect.auth);
  };
};
