/**
 * File: authenticated.js
 * Author: Tommy Gingras
 * Date: 2019-08-18
 * License: All rights reserved Studio Webux S.E.N.C 2015-Present
 */

"use strict";

const { checkToken } = require("./jwt");

const MSG_NOT_AUTHENTICATED = "You are not authenticated";

/**
 * Search the req object to find an access token
 * @private
 * @param {Object} req the object that can contains an access token
 * @returns {String} An access token or null
 * @throws If no access token is provided
 */
function setAccessToken(req) {
  const token =
    req.headers.Authorization ||
    req.headers.authorization ||
    req.cookies.accessToken ||
    req.signedCookies.accessToken ||
    null;

  if (!token) {
    throw new Error("No Access token provided");
  }

  return token;
}

/**
 * Add the JWT scheme name before the token,
 * @private
 * @param {String} scheme
 * @param {String} accessToken
 * @returns {String}
 */
function standardizeToken(scheme, accessToken) {
  return !accessToken.includes(scheme)
    ? `${scheme} ${accessToken}` // e.g Bearer SOME-JWT-TOKEN-FORMAT
    : accessToken;
}

/**
 * It checks if the supplied JWT token is valid, it must use an initialized passport instance.
 * This function is used as a middleware. Check the example to get a better idea about the usage.
 * @public
 * @param {Object} options Configuration object, Mandatory
 * @param {Function} passport passport object, Mandatory
 * @param {Function} errorHandler Custom error handler, this function need 4 parameters
 * @param {Object} log the custom log function, Optional
 */
const isAuthenticated = (options, passport, errorHandler, log = console) => {
  return (req, res, next) => {
    try {
      log.debug(
        "isAuthenticated - try to get the access token from the req object"
      );
      const accessToken = setAccessToken(req);

      log.debug(
        "isAuthenticated - set the access toekn in the req.headers.authorization object"
      );

      // Format the token to be at the good place
      req.headers.authorization = standardizeToken(options.scheme, accessToken);

      passport.authenticate(
        "jwt",
        {
          session: false
        },
        async (err, user) => {
          try {
            if (err) {
              throw err;
            } else if (!err && user) {
              // Check with redis if the token is still allowed
              const valid = await checkToken(
                accessToken.replace(options.scheme + " ", ""),
                user[options.id]
              ).catch(e => {
                log.error(e);
                throw e;
              });

              if (!valid) {
                throw new Error("The token has been blacklisted");
              }

              log.debug("isAuthenticated - The user is authenticated");

              // because this is a middleware, we can append the user object to the req
              req.user = user;
              return next(null, user);
            } else {
              throw new Error("The user hasn't been found");
            }
          } catch (e) {
            return next(errorHandler(401, MSG_NOT_AUTHENTICATED, {}, e));
          }
        }
      )(req, res, next);
    } catch (e) {
      return next(errorHandler(401, MSG_NOT_AUTHENTICATED, {}, e));
    }
  };
};

module.exports = { isAuthenticated };
