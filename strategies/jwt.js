// TODO : add header

"use strict";

const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

// TODO: add comment
const initJWTStrategy = (options, passport, getterFn, log = console) => {
  passport.use(
    "jwt",
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromAuthHeaderWithScheme(options.jwt.scheme),
        secretOrKey: options.jwt.accessSecret
      },
      async (jwtPayload, cb) => {
        if (getterFn && typeof getterFn === "function") {
          const payload = await getterFn(jwtPayload).catch(e => {
            return cb(e);
          });

          if (!payload) {
            return cb("User Information Not Found");
          }
          return cb(null, payload);
        } else {
          return cb(null, jwtPayload);
        }
      }
    )
  );
};

module.exports = { initJWTStrategy };
