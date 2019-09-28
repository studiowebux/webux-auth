/**
 * File: generator.js
 * Author: Tommy Gingras
 * Date: 2019-08-18
 * License: All rights reserved Studio Webux S.E.N.C 2015-Present
 */

"use strict";

/**
 * using the provide length, generate a random string
 * @public
 * @param {Number} len A number of chars to return
 * @returns {String} A randomize string
 */
const generateCode = len => {
  const CHAR =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@$";
  const low = 0;
  const high = CHAR.length;
  let randString = "";
  for (let i = 0; i < len; i++) {
    randString += CHAR[Math.floor(Math.random() * (high - low) + low)];
  }
  return randString;
};

module.exports = { generateCode };
