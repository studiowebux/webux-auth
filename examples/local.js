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
  lostActivationCode,
  initializeRedis
} = require("../index"); // webux-auth

const { getConnections, initializeLocalRedis } = require("./helpers/jwt"); // utilities to get the current connections

const options = require("./config/auth"); // All the options related to the authentication module

const {
  lostActivationFn,
  accountActivationFn
} = require("./helpers/accountActivation"); // User functions for account activation (if needed)

const {
  retrievePasswordFn,
  lostPasswordFn
} = require("./helpers/accountPassword"); // User functions for password recovery (if needed)

const { loginFn, registerFn, deserializeFn } = require("./helpers/local"); // User functions for local authentication (if needed)

const { errorHandler } = require("./helpers/errorHandler"); // User function custom errorHandler
const { /*errorHandler,*/ globalErrorHandler } = require("webux-errorhandler"); // TO handle the errors globally

// Local strategy
initLocalStrategy(options, passport, loginFn, registerFn);

// JWT strategy
initJWTStrategy(options, passport, deserializeFn); // with the getter function, if you have stored the minimum in the JWT token
//initJWTStrategy(options, passport); // without the getter function, if you have stored everything you need in the JWT token

initializeRedis(options.redis); // this is for the webux-auth module
initializeLocalRedis(options.redis); // if needed to retrieve the connections (I recommend to use a database for that)

const isAuth = isAuthenticated(options.jwt, passport, errorHandler); // The middleware function to check if the user is authenticated

/* ---------------- */
// EXPRESS APPLICATION
/* ---------------- */

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// required for the globalErrorHandler
// You can write your own method to handle errors,
// In that case, you can remove that function
express.response["custom"] = function(code, obj) {
  this.status(code);
  this.json({
    message: obj.message,
    success: obj.success
  });
};

// Configure the CORS
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

/* ---------------- */
// EXPRESS ROUTING
/* ---------------- */

app.post("/signin", (req, res, next) => {
  passport.authenticate(
    "local-signin",
    {
      session: false
    },
    (err, user) => {
      try {
        if (err) {
          return next(errorHandler(400, "Incorrect Credentials", {}, error));
        } else if (!err && user) {
          req.login(user, {
            session: false
          });

          return res.status(200).json(user);
        } else {
          return next(
            errorHandler(
              400,
              "Incorrect Credentials",
              {},
              "No User have been found"
            )
          );
        }
      } catch (e) {
        return next(errorHandler(400, "Incorrect Credentials", {}, e));
      }
    }
  )(req, res, next);
});

app.post("/signup", (req, res, next) => {
  passport.authenticate(
    "local-signup",
    {
      session: false
    },
    (err, user) => {
      try {
        if (err) {
          return next(errorHandler(400, "Incorrect Credentials", {}, err));
        } else if (!err && user) {
          // If the auto activate is enabled.
          if (options.local.autoActivate) {
            console.log("The auto activation is enabled");
            console.log(
              "you have to code the update to activate the user account without sending a mail"
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
          return next(
            errorHandler(
              400,
              "Incorrect Credentials",
              {},
              "No User have been found"
            )
          );
        }
      } catch (e) {
        return next(errorHandler(400, "Incorrect Credentials", {}, e));
      }
    }
  )(req, res, next);
});

app.get("/protected", isAuth, (req, res, next) => {
  return res.status(200).json({ msg: "You are connected !", user: req.user });
});

app.get("/my-connection", isAuth, async (req, res, next) => {
  try {
    const connections = await getConnections(req.user.id).catch(e => {
      throw e;
    });

    if (!connections) {
      console.log("You must have at least one connection ... ");
      throw new Error("No connection is available");
    }
    return res.status(200).json({ connections });
  } catch (e) {
    return next(
      errorHandler(
        400,
        "An error occur while retrieving the connections",
        {},
        e
      )
    );
  }
});

app.post("/lost-password", async (req, res, next) => {
  try {
    const info = await lostPassword(req.body.email, lostPasswordFn).catch(e => {
      throw e;
    });
    if (!info) {
      throw new Error("An error occurs while generating the instructions");
    }
    return res.status(200).json({
      msg:
        "Request to retrieve password, you can specify which way is better to send the information generated in the lostPasswordFn",
      info
    });
  } catch (e) {
    return next(
      errorHandler(
        400,
        "An error occur while trying to send the instructions",
        {},
        e
      )
    );
  }
});

app.post("/retrieve-password", async (req, res, next) => {
  try {
    const info = await retrievePassword(
      req.body.email,
      req.body.code,
      req.body.password,
      retrievePasswordFn
    ).catch(e => {
      throw e;
    });
    if (!info) {
      throw new Error("An error occurs while reseting the password");
    }
    return res.status(200).json({
      info
    });
  } catch (e) {
    return next(
      errorHandler(400, "An error occur while reseting the password", {}, e)
    );
  }
});

app.post("/lost-activation", async (req, res, next) => {
  try {
    const info = await lostActivationCode(
      req.body.email,
      lostActivationFn
    ).catch(e => {
      throw e;
    });
    if (!info) {
      throw new Error(
        "An error occurs while generating the lost activation code"
      );
    }
    return res.status(200).json({
      msg:
        "Request to retrieve activation code, you can specify which way is better to send the information generated in the lostActivationFn",
      info
    });
  } catch (e) {
    return next(
      errorHandler(400, "An error occurs to send instructions", {}, e)
    );
  }
});

app.post("/activate-account", async (req, res, next) => {
  try {
    const info = await activateAccount(
      req.body.email,
      req.body.code,
      accountActivationFn
    ).catch(e => {
      throw e;
    });
    if (!info) {
      throw new Error("An error occurs while activating the account");
    }
    return res.status(200).json({
      info
    });
  } catch (e) {
    return next(
      errorHandler(400, "An error occur while activating the account", {}, e)
    );
  }
});

app.post("/revoke-refresh", isAuth, async (req, res, next) => {
  try {
    const info = await RevokeToken(req.body.refreshToken, req.user.id).catch(
      e => {
        throw e;
      }
    );
    if (!info) {
      throw new Error("An error occurs while revoking the refresh token");
    }
    return res.status(200).json({
      msg: "Refresh Token revoked"
    });
  } catch (e) {
    return next(
      errorHandler(
        400,
        "An error occur while revoking the refresh token",
        {},
        e
      )
    );
  }
});

app.post("/revoke-access", isAuth, async (req, res, next) => {
  try {
    const info = await RevokeToken(req.body.accessToken, req.user.id).catch(
      e => {
        throw e;
      }
    );
    if (!info) {
      throw new Error("An error occurs while revoking the access token");
    }
    return res.status(200).json({
      msg: "Access Token revoked"
    });
  } catch (e) {
    return next(
      errorHandler(400, "An error occur while revoking the access token", {}, e)
    );
  }
});

app.post("/logout", isAuth, async (req, res, next) => {
  try {
    const refreshToken = await RevokeRefreshToken(req.body.refreshToken).catch(
      e => {
        throw e;
      }
    );
    if (!refreshToken) {
      throw new Error("Refresh token not removed");
    }

    const accessRemoved = await RevokeAccessToken(req.body.accessToken).catch(
      e => {
        throw e;
      }
    );
    if (!accessRemoved) {
      throw new Error("Access token not removed");
    }
    return res.status(200).json({
      msg: "Successfully logged out"
    });
  } catch (e) {
    return next(errorHandler(400, "An error occur while logging out", {}, e));
  }
});

app.post("/refresh", async (req, res, next) => {
  try {
    const newAccess = await RefreshAccessToken(
      options.jwt,
      req.body.refreshToken,
      req.body.userID
    );

    if (!newAccess) {
      throw new Error("No access token provided");
    }
    return res.status(200).json({
      msg: "Access Token refreshed",
      token: newAccess
    });
  } catch (e) {
    return next(
      errorHandler(403, "An error occur while refreshing the token", {}, e)
    );
  }
});

app.get("*", (req, res, next) => {
  return res.status(404).json({
    msg: "Route not Found"
  });
});

globalErrorHandler(app);

app.listen(1337, () => {
  console.log("Server is listening on port 1337 ...");
});
