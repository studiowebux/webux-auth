// TODO add header
// TODO add comment for each functions

"use strict";

const jwt = require("jsonwebtoken");
let redis;
let client;

if (process.env.NODE_ENV !== "production") {
  console.log("Starting redis mock");
  redis = require("redis-mock");
  client = redis.createClient();

  client.on("error", function(err) {
    console.log("Error " + err);
  });
} else {
  // TODO implement the real redis instance...
}

function saveToken(type, token, userID, expiresIn) {
  try {
    client.hmset(
      token, // The Unique ID
      "type",
      type,
      "token",
      token,
      "userID",
      userID,
      "EX",
      expiresIn
    );
  } catch (e) {
    console.error(e);
  }
}

function serializeUser(user, fields) {
  const payload = {};
  Object.keys(user).forEach(field => {
    if (fields.includes(field)) {
      payload[field] = user[field];
    }
  });
  return payload;
}

const GenerateAccessToken = (options, user) => {
  const payload = serializeUser(user, options.serializeUser);
  const token = jwt.sign(payload, options.accessSecret, {
    expiresIn: options.accessLife
  });

  console.log("Try to save the access token");
  saveToken("access", token, user[options.id], options.accessLife);

  return token;
};

const CheckToken = (accessToken, userID) => {
  return new Promise((resolve, reject) => {
    console.log("Hum ...");
    console.log(accessToken);
    try {
      client.hgetall(accessToken, function(err, obj) {
        console.log(obj);
        console.error(err);
        if (err || !obj) {
          return reject(new Error(err));
        }
        if (obj.userID == userID) {
          console.dir(obj);
          return resolve(true);
        } else {
          console.log("No No NO !");
          return reject("The user ID is invalid");
        }
      });
    } catch (e) {
      console.error(e);
      throw e;
    }
  });
};

const GenerateRefreshToken = (options, user) => {
  const payload = serializeUser(user, options.serializeUser);
  const token = jwt.sign(payload, options.refreshSecret, {
    expiresIn: options.refreshLife
  });
  console.log("Try to save the refresh token");

  saveToken("refresh", token, user[options.id], options.refreshLife);

  return token;
};

const RefreshAccessToken = (options, refreshToken, userID) => {
  try {
    client.hmget(refreshToken, function(err, obj) {
      if (obj.userID === userID && obj.type === "refresh") {
        console.dir(obj);
        return GenerateAccessToken(options, obj);
      } else {
        console.log("No No NO !");
        return false;
      }
    });
  } catch (e) {
    throw e;
  }
};

const RevokeAccessToken = accessToken => {
  client.hdel(accessToken, err => {
    console.error(err);
    if (!err) {
      return true;
    }
    return false;
  });
};

const RevokeRefreshToken = refreshToken => {
  client.hdel(refreshToken, err => {
    console.error(err);
    if (!err) {
      return true;
    }
    return false;
  });
};

const GenerateJWT = (options, user) => {
  try {
    const token = {};
    token.access = GenerateAccessToken(options, user);
    token.refresh = GenerateRefreshToken(options, user);

    return token;
  } catch (e) {
    throw e;
  }
};

module.exports = {
  GenerateJWT,
  RevokeAccessToken,
  RevokeRefreshToken,
  RefreshAccessToken,
  CheckToken
};
