//TODO ADD HEADER

// EXAMPLE using Local sign in/up with JWT

const {
  passport,
  initJWTStrategy,
  initLocalStrategy,
  isAuthenticated,
  retrievePassword,
  lostPassword,
  RefreshAccessToken,
  RevokeAccessToken,
  RevokeRefreshToken,
  activateAccount,
  lostActivationCode
} = require("../index");
const options = require("./config/auth");
const {
  loginFn,
  registerFn,
  deserializeFn,
  lostPasswordFn,
  retrievePasswordFn,
  accountActivationFn,
  lostActivationFn
} = require("./helpers/index");

// Local strategy
initLocalStrategy(options, passport, loginFn, registerFn);

// JWT strategy
initJWTStrategy(options, passport, deserializeFn); // with the getter function
//initJWTStrategy(options, passport); // without the getter function

const isAuth = isAuthenticated(options.jwt, passport);
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

app.get("/protected", isAuth, (req, res, next) => {
  return res.status(200).json({ msg: "You are connected !", user: req.user });
});

app.get("/lost-password", async (req, res, next) => {
  const info = await lostPassword(req.body.email, lostPasswordFn);
  if (!info) {
    return res.status(422).json({ msg: "No info" });
  }
  return res.status(200).json({
    msg:
      "Request to retrieve password, you can specify which way is better to send the information generated in the lostPasswordFn",
    info
  });
});

app.get("/retrieve-password", async (req, res, next) => {
  const info = await retrievePassword(
    req.body.email,
    req.body.code,
    req.body.password,
    retrievePasswordFn
  );
  if (!info) {
    return res.status(422).json({ msg: "No info" });
  }
  return res.status(200).json({
    info
  });
});

app.get("/lost-activation", async (req, res, next) => {
  const info = await lostActivationCode(req.body.email, lostActivationFn);
  if (!info) {
    return res.status(422).json({ msg: "No info" });
  }
  return res.status(200).json({
    msg:
      "Request to retrieve activation code, you can specify which way is better to send the information generated in the lostActivationFn",
    info
  });
});

app.get("/activate-account", async (req, res, next) => {
  const info = await activateAccount(
    req.body.email,
    req.body.code,
    accountActivationFn
  );
  if (!info) {
    return res.status(422).json({ msg: "No info" });
  }
  return res.status(200).json({
    info
  });
});

app.get("/revoke-refresh", isAuth, async (req, res, next) => {
  const info = await RevokeRefreshToken(req.body.refreshToken);
  if (!info) {
    return res.status(422).json({ msg: "No info" });
  }
  return res.status(200).json({
    msg: "Refresh Token revoked"
  });
});

app.get("/revoke-access", isAuth, async (req, res, next) => {
  const info = await RevokeAccessToken(req.body.accessToken);
  if (!info) {
    return res.status(422).json({ msg: "No info" });
  }
  return res.status(200).json({
    msg: "Access Token revoked"
  });
});

app.get("/logout", isAuth, async (req, res, next) => {
  const refreshToken = await RevokeRefreshToken(req.body.accessToken);
  if (!refreshToken) {
    return res.status(422).json({ msg: "Refresh token not removed" });
  }

  const accessRemoved = await RevokeAccessToken(req.body.accessToken);
  if (!accessRemoved) {
    return res.status(422).json({ msg: "Access token not removed" });
  }
  return res.status(200).json({
    msg: "Successfully logged out"
  });
});

app.get("/refresh", async (req, res, next) => {
  const newAccess = await RefreshAccessToken(
    options,
    req.body.refreshToken,
    req.body.userID
  );
  if (!newAccess) {
    return res.status(422).json({ msg: "No info" });
  }
  return res.status(200).json({
    msg: "Access Token refreshed",
    token: newAccess
  });
});

app.listen(1337, () => {
  console.log("Server is listening on port 1337 ...");
});
