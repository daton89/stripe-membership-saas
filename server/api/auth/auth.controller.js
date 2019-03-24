"use strict";

const mongoose = require("mongoose");
const User = require("../../models/user");
const config = require("../../config/environment");
const { authentication } = config;
const { host, verify, create, remove } = authentication;

const rp = require("request-promise");
const logger = require("../../util/logger");

module.exports = {
  whoami(req, res) {
    res.status(200).json(req.user);
  },
  login(req, res, next) {
    rp(config.authentication.host + create, {
      method: "POST",
      json: true,
      body: {
        ...req.body,
        strategy: "local"
      }
    })
      .then(response => {
        res.status(200).json(response);
      })
      .catch(next);
  },
  async signup(req, res, next) {
    try {
      // create new user
      const userInAuth = await rp(config.user.host + config.user.create, {
        method: "POST",
        json: true,
        body: {
          ...req.body
        }
      });

      const user = await User.create({
        email: req.body.email
      });

      const { _id, username, email, creatoIl } = await User.create(userInAuth);
      // authentication
      const auth = await rp(host + create, {
        method: "POST",
        json: true,
        body: {
          ...req.body,
          strategy: "local"
        }
      });

      res.status(201).json(auth);

      const mailOptions = {
        to: "tonydangelo123@gmail.com",
        from: "no-reply@safetyapp.it",
        subject: "New user",
        text: `welcome ${_id} - ${username} - ${email} - ${creatoIl}`
      };
      config.mailer.sendMail(mailOptions, function(err) {
        if (err) {
          console.error("welcome mail", err);
        }
      });
    } catch (err) {
      if (err.code === 11000 || /11000/.test(err.message)) {
        return res.status(400).json({
          message: "Un utente con questa username o e-mail già esiste!"
        });
      }
      next(err);
    }
  }, // eslint-disable-line
  logout(req, res, next) {
    rp({
      uri: config.authentication.host + config.authentication.remove,
      headers: {
        Authorization: req.headers.authorization
      },
      method: "DELETE"
    })
      .then(() => {
        logger.info("logout", req.user);
        res.sendStatus(200);
      })
      .catch(next);
  }
};
