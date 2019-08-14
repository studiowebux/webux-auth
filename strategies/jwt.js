// TODO : add header
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

// TODO: add comment
const initJWTStrategy = (options, passport, getterFn, log = console) => {
  passport.use(
    "jwt",
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromAuthHeaderWithScheme(options.jwt.scheme),
        secretOrKey: options.jwt.accessSecret
      },
      async (jwtPayload, cb) => {
        if (getterFn && typeof getterFn === "Function") {
          //const payload = await getterFn()
        } else {
          log.info(jwtPayload);
          return cb(null, jwtPayload);
        }
      }
    )
  );
};

module.exports = { initJWTStrategy };
