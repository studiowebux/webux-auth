// This file contains the basic usage of the account password feature.

const lostPasswordFn = (email, code) => {
  return new Promise((resolve, reject) => {
    try {
      console.log(
        "Using the email and the code, I have to do something in the database to keep that information"
      );
      console.log("But for now I will only send ok !");
      console.log(email);
      console.log(code);

      console.log(
        "You may use an email, sms to send the link to retrieve the password for the account with the code"
      );
      return resolve(true); // this function must return something !
    } catch (e) {
      throw e;
    }
  });
};

const retrievePasswordFn = (email, code, password) => {
  return new Promise((resolve, reject) => {
    try {
      console.log(
        "Using the email, the code and the new password, I have to do something in the database to keep that information and update everything"
      );

      console.log("1. check if the code is still valid");
      console.log(
        "1.1 check if the code exist and is associated with the email"
      );
      console.log("2. encrypt the password");
      console.log("3. Save the information and reset the lost password fields");
      console.log("But for now I will only send ok !");
      console.log(email);
      console.log(code);
      console.log(password);
      return resolve(true); // this function must return something !
    } catch (e) {
      throw e;
    }
  });
};

module.exports = {
  lostPasswordFn,
  retrievePasswordFn
};
