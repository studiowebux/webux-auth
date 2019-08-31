/**
 * File: jwt.js
 * Author: Tommy Gingras
 * Date: 2019-08-18
 * License: All rights reserved Studio Webux S.E.N.C 2015-Present
 */

"use strict";

const jwt = require("jsonwebtoken");
let redis;
let client;

/**
 * Initialize the Redis connection
 * @param {object} options
 */
const initializeRedis = options => {
  if (options.mock === true) {
    console.log("\x1b[33m", "Webux-auth - Starting redis mock", "\x1b[0m");
    redis = require("redis-mock");
    client = redis.createClient();

    client.on("error", function(err) {
      console.error("\x1b[31m", "Webux-auth - Redis error", "\x1b[0m");
      console.error("\x1b[31m", err, "\x1b[0m");
    });
  } else {
    console.log("\x1b[33m", "Webux-auth - Starting redis client", "\x1b[0m");
    redis = require("redis");
    client = redis.createClient({
      host: options.host,
      no_ready_check: options.no_ready_check,
      password: options.password,
      port: options.port
    });
    client.on("error", function(err) {
      console.error("\x1b[31m", "Webux-auth - Redis error", "\x1b[0m");
      console.error("\x1b[31m", err, "\x1b[0m");
    });
  }
};

/**
 * This function save the token information in a redis database
 * This will allow to manage the token and blacklist the tokens.
 * @param {String} type Must be access or refresh
 * @param {String} token The JWT token
 * @param {String} userID
 * @param {String} expiresIn Time in seconds for the token to expire
 * @param {String} ip The IP of the user
 * @returns {Promise}
 */
function saveToken(type, token, userID, expiresIn, ip) {
  return new Promise((resolve, reject) => {
    try {
      client.hmset(
        token, // The Unique ID
        "type",
        type, // 'access' or 'refresh' token
        "userID",
        userID, // the userID associated with the token
        "from",
        ip || "Unknown", // The IP of the user
        "createdAt",
        new Date(), // The creation date of that entry
        (err, response) => {
          if (err || !response) {
            return reject(err);
          }
          client.expire(token, expiresIn);
          return resolve(response);
        }
      );
    } catch (e) {
      throw e;
    }
  });
}

/**
 * This function will return the user object with specific key-value
 * @param {Object} user The user object retrieved from the backend/database
 * @param {Object} fields It must be an array containing the keys allowed in the JWT payload
 * @returns {Object} the user ready to be serialize
 */
function serializeUser(user, fields) {
  const payload = {};
  Object.keys(user).forEach(field => {
    if (fields.includes(field)) {
      payload[field] = user[field];
    }
  });
  return payload;
}

/**
 * This function will generate a JWT token based on the type supplied.
 * @param {Object} options
 * @param {Object} user
 * @param {String} type must be access or refresh
 * @param {String} ip
 * @returns {Promise} containing the generated token
 */
const GenerateToken = (options, user, type, ip = null) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Generate the payload using the options.serializeUser array
      const payload = serializeUser(user, options.serializeUser);
      // Sign the token using the secret and the payload
      const token = jwt.sign(payload, options[type + "Secret"], {
        expiresIn: options[type + "Life"]
      });

      // Save the token in redis
      const saved = await saveToken(
        type,
        token,
        user[options.id],
        options[type + "Life"],
        ip
      ).catch(e => {
        return reject(e);
      });

      if (!saved) {
        return reject(new Error(type + " token not saved in Redis."));
      }

      return resolve(token);
    } catch (e) {
      throw e;
    }
  });
};

/**
 * Check if the access token match the supplied user ID.
 * @param {String} accessToken
 * @param {String} userID
 * @returns {Promise} Return true if everything is fine
 */
const CheckToken = (accessToken, userID) => {
  return new Promise((resolve, reject) => {
    try {
      client.hgetall(accessToken, (err, obj) => {
        if (err || !obj) {
          return reject(err || new Error("Token not found"));
        } else if (obj.userID == userID) {
          return resolve(true);
        } else {
          return reject(new Error("The information does not match."));
        }
      });
    } catch (e) {
      throw e;
    }
  });
};

/**
 * This funtion use a refresh token to renew and generated a new access token.
 * steps, the refreshToken must be valid and not blacklisted
 * @param {Object} options
 * @param {String} refreshToken
 * @param {String} userID
 * @param {String} ip
 * @returns {Promise} containing the access token.
 */
const RefreshAccessToken = (options, refreshToken, userID, ip = null) => {
  return new Promise((resolve, reject) => {
    try {
      jwt.verify(refreshToken, options.refreshSecret, (err, decoded) => {
        if (err) {
          throw err;
        } else {
          client.hgetall(refreshToken, async (err, obj) => {
            console.log(obj);
            if (err || !obj) {
              return reject(err || new Error("Token not Found"));
            } else if (obj.userID == userID && obj.type === "refresh") {
              const token = await GenerateToken(
                options,
                decoded,
                "access",
                ip
              ).catch(e => {
                throw e;
              });
              if (!token) {
                return reject(new Error("No access token generated"));
              } else {
                return resolve(token);
              }
            } else {
              return reject(new Error("The information does not match"));
            }
          });
        }
      });
    } catch (e) {
      throw e;
    }
  });
};

/**
 * Using the refresh token, it will remove it from redis and blacklisting it in the same occasion.
 * @param {String} token
 * @param {String} userID
 * @returns {Promise} return true or false
 */
const RevokeToken = (token, userID = null) => {
  return new Promise((resolve, reject) => {
    try {
      client.del(token, err => {
        if (!err) {
          if (userID) {
            client.hdel(userID, token, err => {
              if (!err) {
                return resolve(true);
              } else {
                return reject(err);
              }
            });
          } else {
            return resolve(true);
          }
        } else {
          return reject(err);
        }
      });
    } catch (e) {
      throw e;
    }
  });
};

/**
 * Return the access and refresh token in an object.
 * @param {Object} options
 * @param {Object} user
 * @returns {Object} {access:"", refresh:""}
 */
const GenerateJWT = async (options, user, ip = null) => {
  try {
    const token = {};
    token.access = await GenerateToken(options, user, "access", ip).catch(e => {
      throw e;
    });
    token.refresh = await GenerateToken(options, user, "refresh", ip).catch(
      e => {
        throw e;
      }
    );

    return token;
  } catch (e) {
    throw e;
  }
};

module.exports = {
  GenerateJWT,
  RevokeToken,
  RefreshAccessToken,
  CheckToken,
  initializeRedis
};
