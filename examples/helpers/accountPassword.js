// This file contains the basic usage of the account password feature.

const lostPasswordFn = (email, code) => {
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

      console.log("lostPasswordFn - Must return something");
      return resolve(true);
    } catch (e) {
      throw e;
    }
  });
};

const retrievePasswordFn = (email, code, password) => {
  return new Promise((resolve, reject) => {
    try {
      console.log("*-* TEMPLATE *-*");
      console.log(
        "1. You should use a database to store the code generated earlier"
      );
      console.log(
        "2. You have to check if the code and the email match, otherwise return an error"
      );
      console.log(
        "3. if the code and the email match, you have to save the password passed in the request"
      );
      console.log(
        "4. then if you configured a sort of timer to change the password, reset it"
      );
      console.log(
        "-- DO NOT LOG THE PASSWORD IN CLEAR TEXT IN ANY LOGGER / CONSOLE --"
      );
      console.log("Test Purpose");
      console.log("------------");
      console.log(email);
      console.log(code);
      console.log(password);

      console.log("retrievePasswordFn - Must return something");
      return resolve(true);
    } catch (e) {
      throw e;
    }
  });
};

module.exports = {
  lostPasswordFn,
  retrievePasswordFn
};
