/**
 * File: passwordActions.js
 * Author: Tommy Gingras
 * Date: 2019-08-18
 * License: All rights reserved Studio Webux S.E.N.C 2015-Present
 */

"use strict";

const { generateCode } = require("./generator");

/**
 * This function generate a code and using the custom function provided,
 * it will store the information in a database and send the code to the user,
 * the custom function must be like function(email, code){Return Promise()}
 * @public
 * @param {String} email
 * @param {Function} setterFn
 * @param {Number} codeLength
 * @param {Object} log
 */
const lostPassword = (email, setterFn, codeLength = 27, log = console) => {
  return new Promise(async (resolve, reject) => {
    try {
      log.debug(`lostPassword - Try to send a code to reset the user password`);
      log.debug(
        `lostPassword NOTE: format for 'setterFn' => setterFn(email=String, code=String){return Promise()}`
      );
      const code = generateCode(codeLength);
      const configured = await setterFn(email, code).catch(e => {
        return reject(e);
      });

      if (!configured) {
        return reject(
          new Error("An error occurs while executing the function")
        );
      }
      log.debug(
        `lostPassword - Code generated, you have to handle the return and interact with the user`
      );

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
 * @public
 * @param {String} email
 * @param {String} code
 * @param {String} password
 * @param {Function} setterFn
 * @param {Object} log
 */
const retrievePassword = (email, code, password, setterFn, log = console) => {
  return new Promise(async (resolve, reject) => {
    try {
      log.debug(`retrievePassword - Try to update the user password`);
      log.debug(
        `retrievePassword NOTE: format for 'setterFn' => setterFn(email=String, code=String, password=String){return Promise()}`
      );
      const updated = await setterFn(email, code, password).catch(e => {
        return reject(e);
      });

      if (!updated) {
        return reject(
          new Error("An error occurs while executing the function")
        );
      }

      log.debug(
        `retrievePassword - Password Updated, you have to interact with the user using the value returned`
      );

      return resolve("Password updated !");
    } catch (e) {
      log.error(e);
      throw e;
    }
  });
};

module.exports = { lostPassword, retrievePassword };
