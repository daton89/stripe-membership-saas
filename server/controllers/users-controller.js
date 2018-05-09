"use strict";

var User = require("../models/user");
const rp = require("request-promise");
const secrets = require("../config/secrets");
// show user page

// exports.getProfile = async function(req, res, next) {
//   var form = {},
//     error = null,
//     formFlash = req.flash("form"),
//     errorFlash = req.flash("error");

//   if (formFlash.length) {
//     form.email = formFlash[0].email;
//   }
//   if (errorFlash.length) {
//     error = errorFlash[0];
//   }

//   try {
//     const user = await User.findOne({ userId: req.user._id }).lean();
//     console.log("user )>", user);
//     if (!user) {
//       await User.create({
//         userId: req.user._id
//       });
//     }

//     res.render(req.render, { user: req.user, form: form, error: error });
//   } catch (err) {
//     res.render(req.render, { user: req.user, form: form, error: err });
//   }
// };

// Updates generic profile information

exports.postProfile = async function(req, res, next) {
  req.assert("email", "Email is not valid").isEmail();
  req.assert("name", "Name is required").notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.flash("errors", errors);
    return res.redirect(req.redirect.failure);
  }

  try {
    const profile = await rp({
      method: "PUT",
      uri: `${secrets.auth.host}api/v1/profiles`,
      headers: {
        authorization: "Bearer " + req.user.token
      },
      body: {
        nome: req.body.name,
        email: req.body.email
      },
      json: true
    });

    const user = await User.findOne({ userId: req.user._id });

    if (user.email !== req.user.email) {
      user.updateStripeEmail(function(err) {
        if (err) return next(err);
        req.user.email = user.email;
        req.flash("success", { msg: "Profile information updated." });
        res.redirect(req.redirect.success);
      });
    } else {
      res.redirect(req.redirect.success);
    }
  } catch (err) {
    req.flash("errors", { msg: err });
    return res.redirect(req.redirect.failure);
  }
};

// Removes account

exports.deleteAccount = async function(req, res, next) {

  return req.flash("errors", { msg: "Contact the administrator to delete your account." });
  
  try {
    const profile = await rp({
      method: "DELETE",
      uri: `${secrets.auth.host}api/v1/profiles`,
      headers: {
        authorization: `Bearer ${req.user.token}`
      },
      body: {
        nome: req.body.name,
        email: req.body.email
      },
      json: true
    });

    const user = await User.findById(req.user._id);

    user.remove();

    user.cancelStripe();

    req.logout();
    req.flash("info", { msg: "Your account has been deleted." });
    res.redirect(req.redirect.success);
  } catch (err) {
    return next(err);
  }
};

// Adds or updates a users card.

exports.postBilling = async function(req, res, next) {
  const stripeToken = req.body.stripeToken;

  if (!stripeToken) {
    req.flash("errors", { msg: "Please provide a valid card." });
    return res.redirect(req.redirect.failure);
  }

  let user;

  try {
    user = await User.findById(req.user._id);
  } catch (error) {
    return next(error);
  }

  try {
    await user.setCard(stripeToken);
    req.flash("success", { msg: "Billing has been updated." });
    res.redirect(req.redirect.success);
  } catch (err) {
    if (err.code && err.code == "card_declined") {
      req.flash("errors", {
        msg: "Your card was declined. Please provide a valid card."
      });
      return res.redirect(req.redirect.failure);
    }
    req.flash("errors", { msg: "An unexpected error occurred." });
    return res.redirect(req.redirect.failure);
  }
};

exports.postPlan = async function(req, res, next) {
  let plan = req.body.plan;
  let stripeToken;

  if (plan) {
    plan = plan.toLowerCase();
  }

  const user = await User.findOne({ userId: req.user._id });

  if (user.stripe.plan == plan) {
    req.flash("info", {
      msg: "The selected plan is the same as the current plan."
    });
    return res.redirect(req.redirect.success);
  }

  if (req.body.stripeToken) {
    stripeToken = req.body.stripeToken;
  }

  if (!user.stripe.last4 && !req.body.stripeToken) {
    req.flash("errors", {
      msg: "Please add a card to your account before choosing a plan."
    });
    return res.redirect(req.redirect.failure);
  }

  try {
    await user.setPlan(plan, stripeToken);
    req.flash("success", { msg: "Plan has been updated." });
    res.redirect(req.redirect.success);
  } catch (err) {
    let msg;

    if (err.code && err.code == "card_declined") {
      msg = "Your card was declined. Please provide a valid card.";
    } else if (err && err.message) {
      msg = err.message;
    } else {
      msg = "An unexpected error occurred.";
    }

    req.flash("errors", { msg: msg });
    return res.redirect(req.redirect.failure);
  }
};
