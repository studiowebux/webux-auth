/**
 * File: authenticated.js
 * Author: Tommy Gingras
 * Date: 2019-08-18
 * License: All rights reserved Studio Webux S.E.N.C 2015-Present
 */

"use strict";

const { CheckToken } = require("./jwt");

/**
 * It checks if the supplied JWT token is valid, it must use an initialized passport instance.
 * This function is used as a middleware. Check the example to get a better idea about the usage.
 * @param {Object} options
 * @param {Function} passport
 * @param {Object} log
 */
const isAuthenticated = (options, passport, log = console) => {
  return (req, res, next) => {
    try {
      const accessToken =
        req.headers.Authorization ||
        req.headers.authorization ||
        req.cookies.accessToken ||
        req.signedCookies.accessToken ||
        null;

      if (!accessToken) {
        return res.status(403).json({ msg: "You are not authenticated" });
      }

      // Format the token to be at the good place
      req.headers.authorization =
        accessToken.indexOf(options.scheme) === -1
          ? options.scheme + " " + accessToken
          : accessToken;

      if (accessToken) {
        passport.authenticate(
          "jwt",
          {
            session: false
          },
          async (err, user) => {
            try {
              if (err) {
                log.error(err);

                throw err;
              } else if (!err && user) {
                // Check with redis if the token is still allowed
                const valid = await CheckToken(
                  accessToken.replace(options.scheme + " ", ""),
                  user[options.id]
                ).catch(e => {
                  throw e;
                });
                if (!valid) {
                  log.error("The token has been blacklisted");
                  return res
                    .status(403)
                    .json({ msg: "You are not authenticated" });
                }

                // because this is a middleware, we can append the user object to the req
                req.user = user;
                return next(null, user);
              } else {
                return res
                  .status(403)
                  .json({ msg: "You are not authenticated" });
              }
            } catch (e) {
              return res.status(403).json({ msg: "You are not authenticated" });
            }
          }
        )(req, res, next);
      } else {
        log.warn("No access token provided");
        return res.status(403).json({ msg: "You are not authenticated" });
      }
    } catch (e) {
      log.error(e);
      return res.status(403).json({ msg: "You are not authenticated" });
    }
  };
};

module.exports = { isAuthenticated };
