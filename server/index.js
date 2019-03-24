#!/usr/bin/env node

import dotenv from "dotenv";

const loaded = dotenv.config();

if (loaded.error) throw loaded.error;

console.log("loaded.parsed :", loaded.parsed);

var debug = require("debug")("app");
var app = require("./app");
// TODO: config with port

app.set("port", process.env.PORT || 3000);

var server = app.listen(app.get("port"), function() {
  console.log("Express server listening on port " + server.address().port);
});
