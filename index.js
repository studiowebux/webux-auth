// TODO ADD HEADER..

const passport = require("passport");

/**
 *
 * @param {Function} deserializeFn that return a promise, it must contains a user object (Like getting the information from a database)
 * @param {Object} serializeUser Which fields to keep in the token it is an array
 */
function initPassport(deserializeFn, serializeUser) {
  passport.serializeUser((user, cb) => {
    user.map(field => {
      if (serializeUser.includes(field)) {
        return [field];
      }
    });
    cb(null, user);
  });

  passport.deserializeUser(async (user, cb) => {
    deserializedUser = await deserializeFn(user).catch(e => {
      return cb(err);
    });
    if (!deserializedUser) {
      return cb("No User found !");
    }
    return cb(null, deserializedUser);
  });

  return passport;
}

module.exports = { initPassport };
