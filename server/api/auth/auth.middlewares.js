"use strict";

const _ = require("lodash");
const config = require("../../config/env");
const { authentication } = config;
const { host, verify } = authentication;

const rp = require("request-promise");

const AUTH = {
  unauthorized(res) {
    res.sendStatus(401);
  },

  isAuth() {
    return function(req, res, next) {
      // TODO: use jwt validate token to check if it is expired
      // instead of call everytime the auth service

      if (!req.headers.authorization || req.headers.authorization == "null")
        return res.sendStatus(401);

      rp({
        uri: host + verify + req.headers.authorization,
        json: true,
        headers: {
          Authorization: req.headers.authorization
        }
      })
        .then(token => {
          if (!token.userId) return null;
          return rp({
            uri: host + "/users/" + token.userId,
            json: true,
            headers: {
              Authorization: req.headers.authorization
            }
          });
        })
        .then(user => {
          if (!user) return res.sendStatus(401);

          req.user = user;
          next();
        })
        .catch(err => {
          if (err.statusCode === 401) return res.sendStatus(401);
          next(err);
        });
    };
  }
};

module.exports = AUTH;
