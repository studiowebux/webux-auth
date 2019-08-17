const { GenerateCode } = require("./generator");

const activateAccount = (email, code, activateFn, log = console) => {
  return new Promise(async (resolve, reject) => {
    try {
      const activationInfo = await activateFn(email, code).catch(e => {
        return reject(e);
      });

      if (!activationInfo) {
        return reject(
          "An error occurs while executing the account activation function"
        );
      }

      return resolve(activationInfo);
    } catch (e) {
      throw e;
    }
  });
};

const lostActivationCode = (
  email,
  lostActivateFn,
  codeLen = 53,
  log = console
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const code = GenerateCode(codeLen);
      const activationInfo = await lostActivateFn(email, code).catch(e => {
        return reject(e);
      });

      if (!activationInfo) {
        return reject(
          "An error occurs while executing the lost activation function"
        );
      }

      return resolve(activationInfo);
    } catch (e) {
      throw e;
    }
  });
};

module.exports = {
  activateAccount,
  lostActivationCode
};
