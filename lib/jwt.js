/**
 * File: jwt.js
 * Author: Tommy Gingras
 * Date: 2019-08-18
 * License: All rights reserved Studio Webux S.E.N.C 2015-Present
 */

"use strict";

const jwt = require("jsonwebtoken");

let redis;
var client;
/**
 * Initialize the Redis connection
 * TODO: create a webux wrapper dedicated for redis
 * @public
 * @param {object} options the options, Mandatory
 * @param {object} log the custom logger function, optional
 */
function initializeRedis(options, log = console) {
  if (options.mock === true) {
    log.info(`\x1b[33mWebux-auth - Starting redis mock\x1b[0m`);
    redis = require("redis-mock");
  } else {
    log.info(`\x1b[33mWebux-auth - Starting redis client\x1b[0m`);
    redis = require("redis");
  }

  client = redis.createClient({
    host: options.host,
    no_ready_check: options.no_ready_check,
    password: options.password,
    port: options.port
  });

  client.on("error", function(err) {
    log.error(`\x1b[31mWebux-auth - Redis error\x1b[0m`);
    log.error(`\x1b[31m${err}\x1b[0m`);
  });

  return client;
}

/**
 * This function save the token information in a redis database
 * This will allow to manage the token and blacklist the tokens.
 * @private
 * @param {String} type Must be access or refresh
 * @param {String} token The JWT token
 * @param {String} userID
 * @param {String} expiresIn Time in seconds for the token to expire
 * @param {String} ip The IP of the user
 * @param {Objct} log
 * @returns {Promise}
 */
function saveToken(type, token, userID, expiresIn, ip, log = console) {
  return new Promise((resolve, reject) => {
    try {
      log.debug("saveToken - Try to save the Token");

      // The IP parameter is optional
      if (!token || !type || !userID) {
        return reject(
          new Error(
            "At least one mandatory parameter is missing to save the token"
          )
        );
      }

      client.hmset(
        token.toString(), // The Unique ID
        "type",
        type.toString(), // 'access' or 'refresh' token
        "userID",
        userID.toString(), // the userID associated with the token
        "from",
        ip.toString() || "Unknown", // The IP of the user
        "createdAt",
        new Date(), // The creation date of that entry
        (err, response) => {
          if (err || !response) {
            return reject(err);
          }
          log.debug("saveToken - The token has been added in redis");
          client.expire(token, expiresIn);
          return resolve(response);
        }
      );
    } catch (e) {
      log.error(e);
      throw e;
    }
  });
}

/**
 * This function will return the user object with specific key-value
 * @private
 * @param {Object} user The user object retrieved from the backend/database
 * @param {Object} fields It must be an array containing the keys allowed in the JWT payload
 * @param {Object} log
 * @returns {Object} the user ready to be serialize
 */
function serializeUser(user, fields, log = console) {
  const payload = {};
  log.debug(
    "serializeUser - Try to serialize the user using the fields provided"
  );
  Object.keys(user).forEach(field => {
    if (fields.includes(field)) {
      payload[field] = user[field];
    }
  });
  log.debug("serializeUser - User serialized");
  return payload;
}

/**
 * This function will generate a JWT token based on the type supplied.
 * @private
 * @param {Object} options
 * @param {Object} user
 * @param {String} type must be access or refresh
 * @param {String} ip
 * @param {Object} log
 * @returns {Promise} containing the generated token
 */
const generateToken = (options, user, type, ip = null, log = console) => {
  return new Promise(async (resolve, reject) => {
    try {
      log.debug(`generateToken - Try to generate a ${type} token`);
      // Generate the payload using the options.serializeUser array
      const payload = serializeUser(user, options.serializeUser, log);
      // Sign the token using the secret and the payload
      const token = jwt.sign(payload, options[type + "Secret"], {
        expiresIn: options[type + "Life"]
      });

      log.debug(
        `generateToken - The token has been sign and it contains the user serialized`
      );

      // Save the token in redis
      const saved = await saveToken(
        type,
        token,
        user[options.id],
        options[type + "Life"],
        ip,
        log
      ).catch(e => {
        return reject(e);
      });

      if (!saved) {
        return reject(new Error(`${type} token not saved in Redis.`));
      }

      log.debug(`generateToken - The token has been added in redis`);

      return resolve(token);
    } catch (e) {
      log.error(e);
      throw e;
    }
  });
};

/**
 * Check if the access token match the supplied user ID.
 * @public
 * @param {String} accessToken
 * @param {String} userID
 * @param {Object} log
 * @returns {Promise} Return true if everything is fine
 */
const checkToken = (accessToken, userID, log = console) => {
  return new Promise((resolve, reject) => {
    try {
      log.debug(`checkToken - Try to validate the access token validity`);
      client.hgetall(accessToken, (err, obj) => {
        if (err || !obj) {
          return reject(err || new Error("Token not found"));
        } else if (obj.userID && userID && obj.userID === userID.toString()) {
          log.debug(`checkToken - The access token is still valid`);
          return resolve(true);
        } else {
          return reject(new Error("The information does not match."));
        }
      });
    } catch (e) {
      log.error(e);
      throw e;
    }
  });
};

/**
 * This funtion use a refresh token to renew and generated a new access token.
 * steps, the refreshToken must be valid and not blacklisted
 * @public
 * @param {Object} options
 * @param {String} refreshToken
 * @param {String} userID
 * @param {String} ip
 * @param {Object} log
 * @returns {Promise} containing the access token.
 */
const refreshAccessToken = (
  options,
  refreshToken,
  userID,
  ip = null,
  log = console
) => {
  return new Promise((resolve, reject) => {
    try {
      log.debug(
        `refreshAccessToken - Try to refresh the access token using the refresh token provided`
      );
      jwt.verify(refreshToken, options.refreshSecret, (err, decoded) => {
        if (err) {
          throw err;
        } else {
          client.hgetall(refreshToken, async (err, obj) => {
            if (err || !obj) {
              return reject(err || new Error("Token not Found"));
            } else if (
              obj.userID &&
              obj.type &&
              userID &&
              obj.userID === userID.toString() &&
              obj.type === "refresh"
            ) {
              const token = await generateToken(
                options,
                decoded,
                "access",
                ip,
                log
              ).catch(e => {
                throw e;
              });
              if (!token) {
                return reject(new Error("No access token generated"));
              }
              log.debug(`refreshAccessToken - New access token generated`);
              return resolve(token);
            } else {
              return reject(new Error("The information does not match"));
            }
          });
        }
      });
    } catch (e) {
      log.error(e);
      throw e;
    }
  });
};

/**
 * Using the refresh token, it will remove it from redis and blacklisting it in the same occasion.
 * @public
 * @param {String} token
 * @param {String} userID
 * @param {Object} log
 * @returns {Promise} return true or false
 */
const revokeToken = (token, userID = null, log = console) => {
  return new Promise((resolve, reject) => {
    try {
      log.debug(`revokeToken - Try to blacklist the token`);
      client.del(token, err => {
        if (err) {
          return reject(err);
        } else {
          if (userID) {
            client.hdel(userID, token, err => {
              if (err) {
                return reject(err);
              } else {
                log.debug(`revokeToken - Token blacklisted from redis`);
                return resolve(true);
              }
            });
          } else {
            log.debug(`revokeToken - Token blacklisted from redis`);
            return resolve(true);
          }
        }
      });
    } catch (e) {
      log.error(e);
      throw e;
    }
  });
};

/**
 * Return the access and refresh token in an object.
 * @public
 * @param {Object} options
 * @param {Object} user
 * @param {String} ip
 * @param {Object} log
 * @returns {Object} {access:"", refresh:""}
 */
const generateJWT = async (options, user, ip = null, log = console) => {
  try {
    const token = {};
    log.debug(`generateJWT - Try to generate access and refresh token`);

    token.access = await generateToken(options, user, "access", ip, log).catch(
      e => {
        throw e;
      }
    );
    token.refresh = await generateToken(
      options,
      user,
      "refresh",
      ip,
      log
    ).catch(e => {
      throw e;
    });

    log.debug(`generateJWT - Both token generated`);
    return token;
  } catch (e) {
    log.error(e);
    throw e;
  }
};

module.exports = {
  generateJWT,
  revokeToken,
  refreshAccessToken,
  checkToken,
  initializeRedis
};
