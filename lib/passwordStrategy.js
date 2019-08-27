/**
 * File: passwordStrategy.js
 * Author: Tommy Gingras
 * Date: 2019-08-18
 * License: All rights reserved Studio Webux S.E.N.C 2015-Present
 */

"use strict";

/**
 * It compares a password to a custom regex
 * @param {String} regex
 * @param {String} password
 * @returns {Boolean}
 */
const checkPassword = (regex, password) => {
  if (password.match(regex)) {
    return true;
  }
  return false;
};

module.exports = { checkPassword };
