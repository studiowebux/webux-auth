/**
 * File: local.js
 * Author: Tommy Gingras
 * Date: 2019-08-18
 * License: All rights reserved Studio Webux S.E.N.C 2015-Present
 */

"use strict";

const LocalStrategy = require("passport-local").Strategy;
const { checkPassword } = require("../lib/passwordStrategy");
const { GenerateJWT } = require("../lib/jwt");

/**
 * It initializes the local sign in and sign up functions
 * @param {Object} options The local configuration (Username and password field names)
 * @param {Object} passport The Passport Object
 * @param {Function} loginFn The Login Function (username, password, req)=>{return Promise()}
 * @param {Function} registerFn The Register Function (username, password, req)=>{return Promise()}
 * @param {Object} log The custom logging function
 */
const initLocalStrategy = (
  options,
  passport,
  loginFn,
  registerFn,
  log = console
) => {
  if (!options || typeof options !== "object") {
    return reject(
      new Error("The options parameter is required and must be an object")
    );
  }
  if (!passport || typeof passport !== "object") {
    return reject(
      new Error("The passport parameter is required and must be an object")
    );
  }
  if (!loginFn || typeof loginFn !== "function") {
    return reject(
      new Error("The loginFn parameter is required and must be a function")
    );
  }
  if (!registerFn || typeof registerFn !== "function") {
    return reject(
      new Error("The registerFn parameter is required and must be a function")
    );
  }
  if (log && typeof log !== "object") {
    return reject(new Error("The log parameter must be an object"));
  }

  console.log(
    "\x1b[33m",
    "Webux-auth - Initializing the local Sign In and Sign Up Strategy",
    "\x1b[0m"
  );

  /* PASSPORT LOCAL SIGNIN */
  passport.use(
    "local-signin",
    new LocalStrategy(
      {
        usernameField: options.local.username,
        passwordField: options.local.password,
        passReqToCallback: true // allows us to pass back the entire request to the callback
      },
      async (req, username, password, done) => {
        try {
          const ip =
            req.headers["x-forwarded-for"] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            (req.connection.socket
              ? req.connection.socket.remoteAddress
              : null);

          const connected = await loginFn(username, password, req).catch(e => {
            log.error(e);
            return done(e);
          });

          if (!connected) {
            log.error("An error occurs while executing the login function");
            return done("An error occurs while executing the login function");
          }

          connected.tokens = await GenerateJWT(options.jwt, connected, ip);
          return done(null, connected);
        } catch (e) {
          log.error(e);
          return done(e);
        }
      }
    )
  );

  // /* PASSPORT LOCAL SIGNUP */
  passport.use(
    "local-signup",
    new LocalStrategy(
      {
        usernameField: options.local.username,
        passwordField: options.local.password,
        passReqToCallback: true // allows us to pass back the entire request to the callback
      },
      async (req, username, password, done) => {
        try {
          // If the password strategy is enabled.
          if (
            options.local.passwordStrategy.enabled &&
            !checkPassword(options.local.passwordStrategy.regex, password)
          ) {
            log.error(options.local.passwordStrategy.message);
            return done(options.local.passwordStrategy.message);
          }

          const registered = await registerFn(username, password, req).catch(
            e => {
              log.error(e);
              return done(e);
            }
          );

          if (!registered) {
            log.error("An error occurs while executing the register function");
            return done(
              "An error occurs while executing the register function"
            );
          }

          if (options.local.autoLogonOnRegister) {
            var ip =
              req.headers["x-forwarded-for"] ||
              req.connection.remoteAddress ||
              req.socket.remoteAddress ||
              (req.connection.socket
                ? req.connection.socket.remoteAddress
                : null);
            registered.tokens = await GenerateJWT(options.jwt, registered, ip);
            return done(null, registered);
          } else {
            return done(null, registered);
          }
        } catch (e) {
          log.error(e);
          return done(e);
        }
      }
    )
  );
};

module.exports = { initLocalStrategy };
