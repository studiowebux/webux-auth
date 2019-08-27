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
  RevokeToken,
  activateAccount,
  lostActivationCode
} = require("../index");
const { getConnections } = require("./helpers/jwt");
const options = require("./config/auth");
const {
  lostActivationFn,
  accountActivationFn
} = require("./helpers/accountActivation");

const {
  retrievePasswordFn,
  lostPasswordFn
} = require("./helpers/accountPassword");
const { loginFn, registerFn, deserializeFn } = require("./helpers/local");

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
const cookieParser = require("cookie-parser");
const cors = require("cors");

var whitelist = ["http://127.0.0.1:8080", "http://localhost:8080"];
var corsOptions = {
  origin: function(origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("Not allowed by cors");
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

app.use(cookieParser());

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

app.post("/signin", (req, res, next) => {
  console.log("Try to sign in");
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

          return res.status(200).json(user);
        } else {
          return res.status(400).json({ msg: "Invalid Login", error: err });
        }
      } catch (e) {
        return res.status(400).json({ msg: "Invalid Login", error: e });
      }
    }
  )(req, res, next);
});

app.post("/signup", (req, res, next) => {
  console.log("Try to sign up");
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
            return res.status(200).json(user);
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

app.get("/my-connection", isAuth, async (req, res, next) => {
  console.log("Authorized !");
  console.log("Try to get the connections");
  try {
    const connections = await getConnections(req.user.id).catch(e => {
      console.log("or here ??");
      throw e;
    });

    console.log(connections);

    if (!connections) {
      console.log("You must have at least one connection ... ");
      return res.status(200).json({});
    }
    console.log(connections);
    return res.status(200).json({ connections });
  } catch (e) {
    console.error(e);
    console.log("here !");
    return res.status(422).json({ msg: "an error occur.." });
  }
});

app.post("/lost-password", async (req, res, next) => {
  const info = await lostPassword(req.body.email, lostPasswordFn).catch(e => {
    return res.status(400).json({ msg: "Invalid Request" });
  });
  if (!info) {
    return res.status(422).json({ msg: "No info" });
  }
  return res.status(200).json({
    msg:
      "Request to retrieve password, you can specify which way is better to send the information generated in the lostPasswordFn",
    info
  });
});

app.post("/retrieve-password", async (req, res, next) => {
  const info = await retrievePassword(
    req.body.email,
    req.body.code,
    req.body.password,
    retrievePasswordFn
  ).catch(e => {
    return res.status(400).json({ msg: "Invalid Request" });
  });
  if (!info) {
    return res.status(422).json({ msg: "No info" });
  }
  return res.status(200).json({
    info
  });
});

app.post("/lost-activation", async (req, res, next) => {
  const info = await lostActivationCode(req.body.email, lostActivationFn).catch(
    e => {
      return res.status(400).json({ msg: "Invalid Request" });
    }
  );
  if (!info) {
    return res.status(422).json({ msg: "No info" });
  }
  return res.status(200).json({
    msg:
      "Request to retrieve activation code, you can specify which way is better to send the information generated in the lostActivationFn",
    info
  });
});

app.post("/activate-account", async (req, res, next) => {
  const info = await activateAccount(
    req.body.email,
    req.body.code,
    accountActivationFn
  ).catch(e => {
    return res.status(400).json({ msg: "Invalid Request" });
  });
  if (!info) {
    return res.status(422).json({ msg: "No info" });
  }
  return res.status(200).json({
    info
  });
});

app.post("/revoke-refresh", isAuth, async (req, res, next) => {
  const info = await RevokeToken(req.body.refreshToken, req.user.id).catch(
    e => {
      return res.status(400).json({ msg: "Invalid Request" });
    }
  );
  if (!info) {
    return res.status(422).json({ msg: "No info" });
  }
  return res.status(200).json({
    msg: "Refresh Token revoked"
  });
});

app.post("/revoke-access", isAuth, async (req, res, next) => {
  const info = await RevokeToken(req.body.accessToken, req.user.id).catch(e => {
    return res.status(400).json({ msg: "Invalid Request" });
  });
  if (!info) {
    return res.status(422).json({ msg: "No info" });
  }
  return res.status(200).json({
    msg: "Access Token revoked"
  });
});

app.post("/logout", isAuth, async (req, res, next) => {
  const refreshToken = await RevokeRefreshToken(req.body.accessToken).catch(
    e => {
      return res.status(400).json({ msg: "Invalid Request" });
    }
  );
  if (!refreshToken) {
    return res.status(422).json({ msg: "Refresh token not removed" });
  }

  const accessRemoved = await RevokeAccessToken(req.body.accessToken).catch(
    e => {
      return res.status(400).json({ msg: "Invalid Request" });
    }
  );
  if (!accessRemoved) {
    return res.status(422).json({ msg: "Access token not removed" });
  }
  return res.status(200).json({
    msg: "Successfully logged out"
  });
});

app.post("/refresh", async (req, res, next) => {
  try {
    console.log(req.body.refreshToken);
    console.log(req.body.userID);
    console.log(req.body);
    const newAccess = await RefreshAccessToken(
      options.jwt,
      req.body.refreshToken,
      req.body.userID
    );

    if (!newAccess) {
      return res.status(422).json({ msg: "No info" });
    }
    //console.log(newAccess)
    return res.status(200).json({
      msg: "Access Token refreshed",
      token: newAccess
    });
  } catch (e) {
    return res.status(400).json({ msg: "Invalid Request", debug: e });
  }
});

app.get("*", (req, res, next) => {
  return res.status(404).json({
    msg: "Route not Found"
  });
});

app.listen(1337, () => {
  console.log("Server is listening on port 1337 ...");
});
