"use strict";

const router = require("express").Router();
const controller = require("./auth.controller");
const auth = require("./auth.middlewares");

router.get("/whoami", auth.isAuth(), controller.whoami);
router.post("/signup", controller.signup);
router.get("/logout", auth.isAuth(), controller.logout);
router.post("/login", controller.login);

module.exports = router;
