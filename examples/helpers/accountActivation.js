// This file contains the basic usage of the account activation feature.

const lostActivationFn = (email, code) => {
  return new Promise((resolve, reject) => {
    try {
      console.log(
        "Using the email and the code, I have to do something in the database to keep that information"
      );
      console.log("But for now I will only send ok !");
      console.log(email);
      console.log(code);
      console.log(
        "You may use an email, sms to send the link to activate the account with new code"
      );
      return resolve(true); // this function must return something !
    } catch (e) {
      throw e;
    }
  });
};

const accountActivationFn = (email, code) => {
  return new Promise((resolve, reject) => {
    try {
      console.log(
        "Using the email and the code, I have to do something in the database to keep that information and update everything"
      );

      console.log(
        "1. check if the code is valid and the account is not already activated"
      );
      console.log(
        "1.1 check if the code exist and is associated with the email"
      );
      console.log("2. set the account activate in the database");
      console.log("But for now I will only send ok !");
      console.log(email);
      console.log(code);
      return resolve(true); // this function must return something !
    } catch (e) {
      throw e;
    }
  });
};

module.exports = { lostActivationFn, accountActivationFn };
