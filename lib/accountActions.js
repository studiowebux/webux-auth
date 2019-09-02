/**
 * File: accountActions.js
 * Author: Tommy Gingras
 * Date: 2019-08-18
 * License: All rights reserved Studio Webux S.E.N.C 2015-Present
 */

"use strict";

const { GenerateCode } = require("./generator");

/**
 * Using the provided parameters and a custom function to activate the user account.
 * The activate function must look like : function(email, code){return Promise()}
 * @param {String} email
 * @param {String} code
 * @param {Function} activateFn
 * @param {Object} log
 * @returns {Promise}
 */
const activateAccount = (email, code, activateFn, log = console) => {
  return new Promise(async (resolve, reject) => {
    try {
      const activationInfo = await activateFn(email, code).catch(e => {
        return reject(e);
      });

      if (!activationInfo) {
        return reject(
          new Error(
            "An error occurs while executing the account activation function"
          )
        );
      }

      return resolve(activationInfo);
    } catch (e) {
      log.error(e);
      throw e;
    }
  });
};

/**
 * Using the provided parameters and a custom function to send the new activsation code associated with the user account.
 * The  activate function must look like : function(email, code){return Promise()}
 * @param {String} email
 * @param {Function} ActivateCodeFn
 * @param {Number} codeLen
 * @param {Object} log
 * @returns {Promise}
 */
const activationCode = (email, ActivateCodeFn, codeLen = 53, log = console) => {
  return new Promise(async (resolve, reject) => {
    try {
      const code = GenerateCode(codeLen);
      const activationInfo = await ActivateCodeFn(email, code).catch(e => {
        return reject(e);
      });

      if (!activationInfo) {
        return reject(
          new Error("An error occurs while executing the  activation function")
        );
      }

      return resolve(activationInfo);
    } catch (e) {
      log.error(e);
      throw e;
    }
  });
};

module.exports = {
  activateAccount,
  activationCode
};
