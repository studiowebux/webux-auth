/**
 * File: passwordActions.js
 * Author: Tommy Gingras
 * Date: 2019-08-18
 * License: All rights reserved Studio Webux S.E.N.C 2015-Present
 */

"use strict";

const { GenerateCode } = require("./generator");

/**
 * This function generate a code and using the custom function provided,
 * it will store the information in a database and send the code to the user,
 * the custom function must be like function(email, code){Return Promise()}
 * @param {String} email
 * @param {Function} setterFn
 * @param {Number} codeLength
 * @param {Object} log
 */
const lostPassword = (email, setterFn, codeLength = 27, log = console) => {
  return new Promise(async (resolve, reject) => {
    try {
      const code = GenerateCode(codeLength);
      const configured = await setterFn(email, code).catch(e => {
        return reject(e);
      });

      if (!configured) {
        return reject(
          new Error("An error occurs while executing the function")
        );
      }

      return resolve({ code, email, configured });
    } catch (e) {
      log.error(e);
      throw e;
    }
  });
};

/**
 * This function uses the code to update the user password using the custom function provided,
 * the custom function must be like function(email, code, password){Return Promise()}
 * @param {String} email
 * @param {String} code
 * @param {String} password
 * @param {Function} setterFn
 * @param {Object} log
 */
const retrievePassword = (email, code, password, setterFn, log = console) => {
  return new Promise(async (resolve, reject) => {
    try {
      const updated = await setterFn(email, code, password).catch(e => {
        return reject(e);
      });

      if (!updated) {
        return reject(
          new Error("An error occurs while executing the function")
        );
      }

      return resolve("Password updated !");
    } catch (e) {
      log.error(e);
      throw e;
    }
  });
};

module.exports = { lostPassword, retrievePassword };
