/**
 * File: accountActions.js
 * Author: Tommy Gingras
 * Date: 2019-08-18
 * License: All rights reserved Studio Webux S.E.N.C 2015-Present
 */

"use strict";

const { generateCode } = require("./generator");

/**
 * Using the provided parameters and a custom function to activate the user account.
 * The activate function must look like : function(email, code){return Promise()}
 * @public
 * @param {String} email
 * @param {String} code
 * @param {Function} activateFn
 * @param {Object} log
 * @returns {Promise}
 */
const activateAccount = (email, code, activateFn, log = console) => {
  return new Promise(async (resolve, reject) => {
    try {
      log.debug(`activateAccount - Try to activate the user account`);
      log.debug(
        `activateAccount NOTE: format for 'activateFn' => activateFn(email=String, code=String){return Promise()}`
      );
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

      log.debug(`activateAccount - The user account is now activated`);

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
 * @public
 * @param {String} email
 * @param {Function} activateCodeFn
 * @param {Number} codeLen
 * @param {Object} log
 * @returns {Promise}
 */
const activationCode = (email, activateCodeFn, codeLen = 53, log = console) => {
  return new Promise(async (resolve, reject) => {
    try {
      log.debug(
        `activationCode - Try to send a code to activate the user account`
      );
      log.debug(
        `activationCode NOTE: format for 'activateCodeFn' => activateCodeFn(email=String, code=String){return Promise()}`
      );
      const code = generateCode(codeLen);
      const activationInfo = await activateCodeFn(email, code).catch(e => {
        return reject(e);
      });

      if (!activationInfo) {
        return reject(
          new Error("An error occurs while executing the  activation function")
        );
      }

      log.debug(
        `activationCode - The code has been generated, you should handle the return to interact with the user`
      );

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
