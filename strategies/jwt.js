/**
 * File: jwt.js
 * Author: Tommy Gingras
 * Date: 2019-08-18
 * License: All rights reserved Studio Webux S.E.N.C 2015-Present
 */

"use strict";

const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

/**
 * This function initialize the JWT strategy using the passport function
 * You can provide a custom function to get the user payload, or use only the jwt payload.
 * the custom function must be defined like : function(payload){return Promise()}
 * @param {Object} options
 * @param {Function} passport
 * @param {Function} getterFn
 * @param {Object} log
 */
const initJWTStrategy = (options, passport, getterFn, log = console) => {
  console.log(
    "\x1b[33m",
    "Webux-auth - Initializing the JWT Strategy",
    "\x1b[0m"
  );
  try {
    passport.use(
      "jwt",
      new JWTStrategy(
        {
          jwtFromRequest: ExtractJWT.fromAuthHeaderWithScheme(
            options.jwt.scheme
          ),
          secretOrKey: options.jwt.accessSecret
        },
        async (jwtPayload, cb) => {
          if (getterFn && typeof getterFn === "function") {
            console.log(
              "\x1b[33m",
              "Webux-auth - The JWT Strategy uses a custom getter function for the payload",
              "\x1b[0m"
            );
            const payload = await getterFn(jwtPayload).catch(e => {
              throw e;
            });

            if (!payload) {
              return cb("User Information Not Found");
            }
            return cb(null, payload);
          } else {
            console.log(
              "\x1b[33m",
              "Webux-auth - The JWT Strategy uses the payload as is",
              "\x1b[0m"
            );
            return cb(null, jwtPayload);
          }
        }
      )
    );
  } catch (e) {
    log.error(e);
    return cb(e);
  }
};

module.exports = { initJWTStrategy };
