const deserializeFn = user => {
  return new Promise((resolve, reject) => {
    try {
      console.log(user);
      console.log(
        "Based on that ID do an API call to retrieve all the user information..."
      );
      return resolve({ id: 1, fullname: "Bob", city: "Montreal" });
    } catch (e) {
      throw e;
    }
  });
};

const loginFn = (email, password, req) => {
  return new Promise((resolve, reject) => {
    try {
      console.log(
        "If you need the req paramater, otherwise you can remove it..."
      );
      if (email && password) {
        console.log("Credentials present !");
        return resolve({
          id: 1, // you can set it at 2 for testing.
          email: email,
          password: password,
          fullname: req.body.fullname,
          city: req.body.city
        });
      }
    } catch (e) {
      throw e;
    }
  });
};

const registerFn = (email, password, req) => {
  return new Promise((resolve, reject) => {
    try {
      console.log(
        "If you need the req paramater, otherwise you can remove it..."
      );
      if (email && password) {
        console.log("Credentials present !");
        return resolve({
          id: 3,
          email: email,
          city: req.body.city,
          fullname: req.body.fullname,
          password: password
        });
      }
    } catch (e) {
      throw e;
    }
  });
};

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
module.exports = {
  registerFn,
  loginFn,
  deserializeFn,
  lostPasswordFn,
  retrievePasswordFn,
  accountActivationFn,
  lostActivationFn
};
