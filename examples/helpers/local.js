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
          fullname: req.body.fullname || "Bob",
          city: req.body.city || "Everywhere"
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

module.exports = { deserializeFn, registerFn, loginFn };
