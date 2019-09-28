/**
 * File: local.js
 * Author: Tommy Gingras
 * Date: 2019-08-18
 * License: All rights reserved Studio Webux S.E.N.C 2015-Present
 */

"use strict";

const LocalStrategy = require("passport-local").Strategy;
const { checkPassword } = require("../lib/passwordStrategy");
const { generateJWT } = require("../lib/jwt");

/**
 * Return the IP of the client
 * @private
 * @param {Object} req Express req object
 */
function setIp(req) {
  return (
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null)
  );
}

/**
 * It initializes the local sign in and sign up functions
 * @public
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
  log.info(
    `\x1b[33mWebux-auth - Initializing the local Sign In and Sign Up Strategy\x1b[0m`
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
      (req, username, password, done) => {
        try {
          const ip = setIp(req);
          log.debug(
            `loginFn(username = String, password = String, req = Object) {return Promise()}`
          );
          loginFn(username, password, req)
            .then(async connected => {
              connected.tokens = await generateJWT(
                options.jwt,
                connected,
                ip,
                log
              ).catch(e => {
                return done(e);
              });
              return done(null, connected);
            })
            .catch(e => {
              return done(e);
            });
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
      (req, username, password, done) => {
        try {
          // If the password strategy is enabled.
          if (
            options.local.passwordStrategy.enabled &&
            !checkPassword(options.local.passwordStrategy.regex, password)
          ) {
            throw new Error(options.local.passwordStrategy.message);
          }
          log.debug(
            `registerFn(username = String, password = String, req = Object) {return Promise()}`
          );
          registerFn(username, password, req)
            .then(async registered => {
              if (options.local.autoLogonOnRegister) {
                var ip = setIp(req);

                registered.tokens = await generateJWT(
                  options.jwt,
                  registered,
                  ip,
                  log
                ).catch(e => {
                  return done(e);
                });
                return done(null, registered);
              } else {
                return done(null, registered);
              }
            })
            .catch(e => {
              return done(e);
            });
        } catch (e) {
          log.error(e);
          return done(e);
        }
      }
    )
  );
};

module.exports = { initLocalStrategy };
