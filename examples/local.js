//TODO ADD HEADER

const { initPassport } = require("../index");
const { initLocalStrategy } = require("../strategies/local");
const { initJWTStrategy } = require("../strategies/jwt");
const { isAuthenticated } = require("../lib/authenticated");

const deserializeFn = user => {
  return new Promise((resolve, reject) => {
    try {
      console.log(user);
      console.log(
        "Based on that ID do an API call to retrieve all the user information..."
      );
      return resolve({ _id: 1, fullname: "Bob", city: "Montreal" });
    } catch (e) {
      throw e;
    }
  });
};

const serializeUser = ["_id", "fullname"];

const passport = initPassport(deserializeFn, serializeUser);

const loginFn = (email, password, req) => {
  return new Promise((resolve, reject) => {
    try {
      console.log(
        "If you need the req paramater, otherwise you can remove it..."
      );
      if (email && password) {
        console.log("Credentials present !");
        return resolve({ id: 2, fullname: "Bobby", city: "Quebec" });
      }
    } catch (e) {
      throw e;
    }
  });
};

const registerFn = (email, password, req) => {
  return new Promise((resolve, reject) => {
    try {
      console.log(
        "If you need the req paramater, otherwise you can remove it..."
      );
      if (email && password) {
        console.log("Credentials present !");
        return resolve({
          id: 3,
          email: email,
          city: req.body.city,
          fullname: req.body.fullname,
          password: password
        });
      }
    } catch (e) {
      throw e;
    }
  });
};

const options = {
  local: {
    username: "email",
    password: "password",
    passwordStrategy: {
      enabled: false,
      regex: "",
      message: "The password strategy is enabled and you must be compliant."
    },
    autoLogonOnRegister: true,
    autoActivate: false
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "SHUUUT!",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "SHUUUUT!",
    accessLife: 900,
    refreshLife: 86400,
    scheme: "Bearer",
    id: "id"
  }
};

initLocalStrategy(options, passport, loginFn, registerFn);
initJWTStrategy(options, passport);

/* ---------------- */
// EXPRESS APPLICATION
/* ---------------- */

const express = require("express");
const app = express();
const bodyParser = require("body-parser");

app.use(
  bodyParser.json({
    limit: "1mb"
  })
);

app.use(
  bodyParser.urlencoded({
    limit: "1mb",
    extended: true
  })
);

app.get("/login", (req, res, next) => {
  passport.authenticate(
    "local-signin",
    {
      session: false
    },
    (err, user) => {
      try {
        if (err) {
          throw err;
        } else if (!err && user) {
          req.login(user, {
            session: false
          });

          return res.status(200).json({ connected: user });
        } else {
          return res.status(400).json({ msg: "Invalid Login", error: err });
        }
      } catch (e) {
        return res.status(400).json({ msg: "Invalid Login", error: e });
      }
    }
  )(req, res, next);
});

app.get("/register", (req, res, next) => {
  passport.authenticate(
    "local-signup",
    {
      session: false
    },
    (err, user) => {
      try {
        if (err) {
          throw err;
        } else if (!err && user) {
          // If the auto activate is enabled.
          if (options.local.autoActivate) {
            console.log(
              "The auto activation is enabled, you have to code the update to activate the user account without sending a mail"
            );
          } else {
            console.log(
              "Send a mail to the user with an activation code, to activate the user account"
            );
          }
          // Auto login is enabled.
          if (options.local.autoLogonOnRegister) {
            req.login(user, {
              session: false
            });
            return res.status(200).json({ connected: user });
          } else {
            return res
              .status(200)
              .json({ msg: "Account successfully created." });
          }
        } else {
          return res.status(400).json({ msg: "Invalid Login", error: err });
        }
      } catch (e) {
        res.status(400).json({ msg: "Invalid Login", error: e });
      }
    }
  )(req, res, next);
});

app.get("/protected", isAuthenticated(passport), (req, res, next) => {
  return res.status(200).json({ msg: "You are connected !" });
});

app.listen(1337, () => {
  console.log("Server is listening on port 1337 ...");
});
