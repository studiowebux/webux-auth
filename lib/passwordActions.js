// TODO Add header
// TODO add comment Fn
"use strict";

const { GenerateCode } = require("./generator");

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
      throw e;
    }
  });
};

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
      throw e;
    }
  });
};

module.exports = { lostPassword, retrievePassword };
