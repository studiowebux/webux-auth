// TODO add header

const passport = require("passport");
const { isAuthenticated } = require("./lib/authenticated");
const { initJWTStrategy } = require("./strategies/jwt");
const { initLocalStrategy } = require("./strategies/local");
const { lostPassword, retrievePassword } = require("./lib/passwordActions");
const { lostActivationCode, activateAccount } = require("./lib/accountActions");
const {
  RevokeAccessToken,
  RevokeRefreshToken,
  RefreshAccessToken
} = require("./lib/jwt");

module.exports = {
  isAuthenticated,
  initJWTStrategy,
  initLocalStrategy,
  passport,
  lostPassword,
  retrievePassword,
  lostActivationCode,
  activateAccount,
  RefreshAccessToken,
  RevokeAccessToken,
  RevokeRefreshToken,
};
