"use strict";

// middleware
import { isAuthenticated, isUnauthenticated } from "./middleware/auth";
import { setRedirect, setRender } from "middleware-responder";

const StripeWebhook = require("stripe-webhook-middleware");
const stripeEvents = require("./middleware/stripe-events");
const secrets = require("./config/secrets");
// controllers
var users = require("./controllers/users-controller");
const main = require("./controllers/main-controller");
const dashboard = require("./controllers/dashboard-controller");
const passwords = require("./controllers/passwords-controller");
const registrations = require("./controllers/registrations-controller");
const sessions = require("./controllers/sessions-controller");

var stripeWebhook = new StripeWebhook({
  stripeApiKey: secrets.stripeOptions.apiKey,
  respond: true
});

module.exports = function(app, passport) {
  // homepage and dashboard
  app.get(
    "/",
    setRedirect({ auth: "/dashboard" }),
    isUnauthenticated(),
    setRender("index"),
    main.getHome
  );

  app.use("/api/v1/auth", require("./api/auth"));

  // sessions
  app.post(
    "/login",
    setRedirect({ auth: "/dashboard", success: "/dashboard", failure: "/" }),
    isUnauthenticated(),
    sessions.postLogin
  );
  app.get(
    "/logout",
    setRedirect({ auth: "/", success: "/" }),
    isAuthenticated(),
    sessions.logout
  );

  // registrations
  app.get(
    "/signup",
    setRedirect({ auth: "/dashboard" }),
    isUnauthenticated(),
    setRender("signup"),
    registrations.getSignup
  );
  app.post(
    "/signup",
    setRedirect({
      auth: "/dashboard",
      success: "/dashboard",
      failure: "/signup"
    }),
    isUnauthenticated(),
    registrations.postSignup
  );

  // forgot password
  app.get(
    "/forgot",
    setRedirect({ auth: "/dashboard" }),
    isUnauthenticated(),
    setRender("forgot"),
    passwords.getForgotPassword
  );
  app.post(
    "/forgot",
    setRedirect({ auth: "/dashboard", success: "/forgot", failure: "/forgot" }),
    isUnauthenticated(),
    passwords.postForgotPassword
  );

  // reset tokens
  app.get(
    "/reset/:token",
    setRedirect({ auth: "/dashboard", failure: "/forgot" }),
    isUnauthenticated(),
    setRender("reset"),
    passwords.getToken
  );
  app.post(
    "/reset/:token",
    setRedirect({ auth: "/dashboard", success: "/dashboard", failure: "back" }),
    isUnauthenticated(),
    passwords.postToken
  );

  app.get(
    "/dashboard",
    setRender("dashboard/index"), // this set req.render
    setRedirect({ auth: "/" }), // this set req.redirect
    isAuthenticated(),
    dashboard.getDefault
  );
  app.get(
    "/billing",
    setRender("dashboard/billing"),
    setRedirect({ auth: "/" }),
    isAuthenticated(),
    dashboard.getBilling
  );
  app.get(
    "/profile",
    setRender("dashboard/profile"),
    setRedirect({ auth: "/" }),
    isAuthenticated(),
    dashboard.getProfile
  );

  // user api stuff
  app.post(
    "/user",
    setRedirect({ auth: "/", success: "/profile", failure: "/profile" }),
    isAuthenticated(),
    users.postProfile
  );
  app.post(
    "/user/billing",
    setRedirect({ auth: "/", success: "/billing", failure: "/billing" }),
    isAuthenticated(),
    users.postBilling
  );
  app.post(
    "/user/plan",
    setRedirect({ auth: "/", success: "/billing", failure: "/billing" }),
    isAuthenticated(),
    users.postPlan
  );
  app.post(
    "/user/password",
    setRedirect({ auth: "/", success: "/profile", failure: "/profile" }),
    isAuthenticated(),
    passwords.postNewPassword
  );
  app.post(
    "/user/delete",
    setRedirect({ auth: "/", success: "/" }),
    isAuthenticated(),
    users.deleteAccount
  );

  // use this url to receive stripe webhook events
  app.post("/stripe/events", stripeWebhook.middleware, stripeEvents);

  // authentication routes
  // app.use('/auth', require('./auth').default);
};
