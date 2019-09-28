/**
 * File: index.js
 * Author: Tommy Gingras
 * Date: 2019-08-18
 * License: All rights reserved Studio Webux S.E.N.C 2015-Present
 */

"use strict";

const passport = require("passport");
const { isAuthenticated } = require("./lib/authenticated");
const { initJWTStrategy } = require("./strategies/jwt");
const { initLocalStrategy } = require("./strategies/local");
const { lostPassword, retrievePassword } = require("./lib/passwordActions");
const { activationCode, activateAccount } = require("./lib/accountActions");
const { revokeToken, refreshAccessToken, checkToken } = require("./lib/jwt");
const { initializeRedis } = require("./lib/redis");

// Export all modules
module.exports = {
  isAuthenticated,
  initJWTStrategy,
  initLocalStrategy,
  passport,
  lostPassword,
  retrievePassword,
  activationCode,
  activateAccount,
  refreshAccessToken,
  revokeToken,
  initializeRedis,
  checkToken
};
