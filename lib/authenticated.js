// TODO HEADER
// TODO add comment for each functions
"use strict";

const { CheckToken } = require("./jwt");

const isAuthenticated = (options, passport, log = console) => {
  return (req, res, next) => {
    try {
      const accessToken =
        req.headers.Authorization || req.headers.authorization;

      if (accessToken) {
        passport.authenticate(
          "jwt",
          {
            session: false
          },
          async (err, user) => {
            if (err) {
              log.error(err);
              return res.status(403).json({ msg: "You are not authenticated" });
            } else if (!err && user) {
              console.log(accessToken);
              console.log(user);
              console.log(options.id);
              console.log(user[options.id]);

              const valid = await CheckToken(
                accessToken.replace(options.scheme + " ", ""),
                user[options.id]
              );
              if (!valid) {
                console.log("THe check token function failed...");
                return res
                  .status(403)
                  .json({ msg: "You are not authenticated" });
              }
              console.log("connected !");
              req.user = user;

              return next(null, user);
            } else {
              return res.status(403).json({ msg: "You are not authenticated" });
            }
          }
        )(req, res, next);
      } else {
        return res.status(403).json({ msg: "You are not authenticated" });
      }
    } catch (e) {
      log.error(e);
      return res.status(403).json({ msg: "You are not authenticated" });
    }
  };
};

module.exports = { isAuthenticated };
