// This file should not be use for production
// I think it is better to use a Mongo to store the refreshToken
// It will allow to keep alive the tokens even when the application is restarted
// Otherwise they will see has blacklisted.

let redis;
let client;

//initialize the Redis connection depending of the node env.
const initializeLocalRedis = options => {
  //initialize the Redis connection depending of the node env.
  if (options.mock === true) {
    console.log(`\x1b[33mjwt-helper - Starting redis mock\x1b[0m`);
    redis = require("redis-mock");
    client = redis.createClient();

    client.on("error", function(err) {
      console.error(`\x1b[31mjwt-helper - Redis error\x1b[0m`);
      console.error(`\x1b[31m${err}\x1b[0m`);
    });
  } else {
    console.log(`\x1b[33mjwt-helper - Starting redis client\x1b[0m`);
    redis = require("redis");
    client = redis.createClient({
      host: options.host,
      no_ready_check: options.no_ready_check,
      password: options.password,
      port: options.port
    });
    client.on("error", function(err) {
      console.error(`\x1b[31mjwt-helper - Redis error\x1b[0m`);
      console.error(`\x1b[31m${err}\x1b[0m`);
    });
  }
};

// Get the tokens from Redis and list them to the user
function getInfo(token, userID) {
  return new Promise((resolve, reject) => {
    try {
      client.hgetall(token, (err, result) => {
        if (err) {
          return reject(err);
        } else if (result && result.userID == userID) {
          return resolve({ ...result, token });
        } else {
          return resolve();
        }
      });
    } catch (e) {
      throw e;
    }
  });
}

// For each tokens available, we have to validate that they are own by the user
async function checkTokens(tokens, userID) {
  try {
    let myTokens = [];
    for (const token of tokens) {
      const t = await getInfo(token, userID).catch(e => {
        throw e;
      });
      if (t) {
        myTokens.push(t);
      }
    }
    return myTokens;
  } catch (e) {
    throw e;
  }
}

// This function should not be use for production, Use the database to store that information.
const getConnections = userID => {
  return new Promise((resolve, reject) => {
    try {
      if (userID) {
        console.log(
          "you should store the access/refresh token in a mongo DB instead, you will be able to get only the wanted tokens easily..."
        );
        client.keys("*", (err, obj) => {
          if (err || !obj || obj.length === 0) {
            return reject(err || new Error("Token not found"));
          } else {
            Promise.all([checkTokens(obj, userID)])
              .then(tokens => {
                return resolve(tokens[0]);
              })
              .catch(e => {
                return reject(e);
              });
          }
        });
      } else {
        return reject(new Error("A User ID must be provide"));
      }
    } catch (e) {
      throw e;
    }
  });
};

module.exports = { getConnections, initializeLocalRedis };
