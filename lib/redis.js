/**
 * File: redis.js
 * Author: Tommy Gingras
 * Date: 2019-08-18
 * License: All rights reserved Studio Webux S.E.N.C 2015-Present
 */

"use strict";

let redis;
let client;

/**
 * Initialize the Redis connection
 * @public
 * @param {object} options the options, Mandatory
 * @param {object} log the custom logger function, optional
 */
const initializeRedis = (options, log = console) => {
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
};

module.exports = { initializeRedis, client };
