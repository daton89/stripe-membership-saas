const User = require("../models/user");
const plans = User.getPlans();
const rp = require("request-promise");
const secrets = require("../config/secrets");

module.exports = {
  async getDefault(req, res, next) {
    var form = {},
      error = null,
      formFlash = req.flash("form"),
      errorFlash = req.flash("error");

    if (formFlash.length) {
      form.email = formFlash[0].email;
    }
    if (errorFlash.length) {
      error = errorFlash[0];
    }

    try {
      const user = await User.findOne({ userId: req.user._id }).lean();

      if (!user) {
        await User.create({
          email: req.user.email,
          userId: req.user._id
        });
      }

      res.render(req.render, { user, form, plans, error });
    } catch (error) {
      res.render(req.render, { user: req.user, form, plans, error });
    }

  },

  async getBilling(req, res, next) {
    var form = {},
      error = null,
      formFlash = req.flash("form"),
      errorFlash = req.flash("error");

    if (formFlash.length) {
      form.email = formFlash[0].email;
    }
    if (errorFlash.length) {
      error = errorFlash[0];
    }

    try {
      const user = await User.findOne({ userId: req.user._id }).lean();

      if (!user) {
        await User.create({
          email: req.user.email,
          userId: req.user._id
        });
      }

      res.render(req.render, { user, form, plans, error });
    } catch (error) {
      res.render(req.render, { user: req.user, form, plans, error });
    }
  },

  async getProfile(req, res, next) {
    var form = {},
      error = null,
      formFlash = req.flash("form"),
      errorFlash = req.flash("error");

    if (formFlash.length) {
      form.email = formFlash[0].email;
    }
    if (errorFlash.length) {
      error = errorFlash[0];
    }
    try {
      let user = await User.findOne({ userId: req.user._id }).lean();

      if (!user) {
        await User.create({
          email: req.user.email,
          userId: req.user._id
        });
      }

      const profile = await rp({
        method: "GET",
        uri: `${secrets.auth.host}api/v1/profiles`,
        headers: {
          authorization: "Bearer " + req.user.token
        },
        json: true
      });

      user = Object.assign({}, profile, user);

      res.render(req.render, { user, form, plans, error });
    } catch (error) {
      res.render(req.render, { user: req.user, form, plans, error });
    }
  }
};
