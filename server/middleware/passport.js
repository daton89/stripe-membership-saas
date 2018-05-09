var LocalStrategy = require("passport-local").Strategy;
var User = require("../models/user");
var rp = require("request-promise");
const secrets = require("../config/secrets");
const moment = require("moment");

module.exports = function(passport) {
  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(async function(user, done) {
    try {
      // console.log("deserializeUser =>", user);
      // const user = await User.findOne({ email });
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // login
  passport.use(
    "login",
    new LocalStrategy(
      {
        usernameField: "email",
        passReqToCallback: true
      },
      async function(req, email, password, done) {
        try {
          // TODO: call /api/v1/auth/login on auth host
          const signin = await rp({
            method: "POST",
            uri: secrets.auth.host + "api/v1/auth/login",
            body: {
              username: email,
              password
            },
            json: true
          });
          console.log("signin =>", signin);

          // const token = signin.token;
          // const expires_in = signup.message.expires_in;
          // const expires_in = moment().add(15, 'minutes');
          // const user = await User.findOneAndUpdate({ email }, { token, expires_in }, { new: true });
          req.login(signin, err => {
            if (err)
              return done(
                err,
                false,
                req.flash("error", err.message || "Unrecognized error")
              );

            return done(null, signin, null);
          });
        } catch (err) {
          return done(
            err,
            false,
            req.flash("error", err.message || "Unrecognized error")
          );
        }
      }
    )
  );

  passport.use(
    "signup",
    new LocalStrategy(
      {
        usernameField: "email",
        passReqToCallback: true
      },
      function(req, email, password, done) {
        var findOrCreateUser = async function() {
          return done(true, false, req.flash("error", "Error singup user."));

          try {
            const signin = await rp({
              method: "POST",
              uri: secrets.auth.host + "access/signin",
              body: {
                email,
                password
              },
              json: true
            });

            req.flash("form", {
              email: req.body.email
            });

            return done(
              null,
              false,
              req.flash(
                "error",
                "An account with that email address already exists."
              )
            );
          } catch (err) {
            if (err.statusCode === 404) {
              let signup;
              try {
                signup = await rp({
                  method: "POST",
                  uri: secrets.auth.host + "access/signup",
                  body: {
                    name: email, // remove
                    phone: email, // remove
                    email,
                    password
                  },
                  json: true
                });
              } catch (err) {
                return done(
                  err,
                  false,
                  req.flash("error", "Error singup user.")
                );
              }
              console.log("signup =>", signup);
              try {
                // edit this portion to accept other properties when creating a user.
                const token = signup.message.token;
                // const expires_in = signup.message.expires_in;
                const expires_in = moment().add(10, "minutes");
                const user = await User.create({
                  email: req.body.email,
                  token,
                  expires_in
                });
                return done(
                  null,
                  user,
                  req.flash("success", "Thanks for signing up!!")
                );
              } catch (err) {
                return done(
                  err,
                  false,
                  req.flash("error", "Error saving user.")
                );
              }
            } else {
              return done(err, false, req.flash("error", "Error signup user."));
            }
          }
        };

        process.nextTick(findOrCreateUser);
      }
    )
  );
};
