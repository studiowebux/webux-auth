const deserializeFn = user => {
  return new Promise((resolve, reject) => {
    try {
      console.log(user);
      console.log(
        "Based on that ID do an API call to retrieve all the user information..."
      );
      // we simulate a database query
      setTimeout(() => {
        return resolve({ id: 1, fullname: "Bob", city: "Montreal" });
      }, 1500);
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
        setTimeout(() => {
          return resolve({
            id: 1, // you can set it at 2 for testing.
            email: email,
            password: password,
            fullname: req.body.fullname || "Bob",
            city: req.body.city || "Everywhere"
          });
        }, 1000);
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
        setTimeout(() => {
          return resolve({
            id: 3,
            email: email,
            city: req.body.city,
            fullname: req.body.fullname,
            password: password
          });
        }, 2000);
      }
    } catch (e) {
      throw e;
    }
  });
};

module.exports = { deserializeFn, registerFn, loginFn };
