// This file contains the basic usage of the account activation feature.

const lostActivationFn = (email, code) => {
  return new Promise((resolve, reject) => {
    try {
      console.log("*-* TEMPLATE *-*");
      console.log(
        "1. You should use a database to store the code generated here"
      );
      console.log(
        "2. You have to send the code using your way to the end-user"
      );
      console.log("Test Purpose");
      console.log("------------");
      console.log(email);
      console.log(code);

      console.log("lostActivationFn - Must return something");
      return resolve(true);
    } catch (e) {
      throw e;
    }
  });
};

const accountActivationFn = (email, code) => {
  return new Promise((resolve, reject) => {
    try {
      console.log("*-* TEMPLATE *-*");
      console.log(
        "1. You should use a database to store the code generated earlier"
      );
      console.log(
        "2. Validate the code sent to the user using its email with the code"
      );
      console.log(
        "3. If the email and the code match - Activate the acount, otherwise return an error"
      );
      console.log("Test Purpose");
      console.log("------------");
      console.log(email);
      console.log(code);

      console.log("accountActivationFn - Must return something");

      return resolve(true);
    } catch (e) {
      throw e;
    }
  });
};

module.exports = { lostActivationFn, accountActivationFn };
