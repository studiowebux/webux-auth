// TODO ADD HEADER
"use strict";

const LocalStrategy = require("passport-local").Strategy;
const { checkPassword } = require("../lib/passwordStrategy");
const { GenerateJWT } = require("../lib/jwt");

/**
 * It initializes the local sign in and sign up functions
 * @param {Object} options The local configuration (Username and password field names)
 * @param {Object} passport The Passport Object
 * @param {Function} loginFn The Login Function (username, password, req)=>{}
 * @param {Function} registerFn The Register Function (username, password, req)=>{}
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
          const connected = await loginFn(username, password, req).catch(e => {
            return done(e);
          });

          if (!connected) {
            return done("Sign In Error");
          }

          const tokens = GenerateJWT(options.jwt, connected);
          connected.tokens = tokens;
          return done(null, connected);
        } catch (e) {
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
            return done(options.local.passwordStrategy.message);
          }

          const registered = await registerFn(username, password, req).catch(
            e => {
              return done(e);
            }
          );

          if (!registered) {
            return done("Sign Up Error");
          }

          if (options.local.autoLogonOnRegister) {
            const tokens = GenerateJWT(options.jwt, registered);
            registered.tokens = tokens;
            return done(null, registered);
          } else {
            return done(null, registered);
          }
        } catch (e) {
          return done(e);
        }
      }
    )
  );
};

module.exports = { initLocalStrategy };
