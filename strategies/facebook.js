// TODO - EVERYTHING !

const FacebookStrategy = require("passport-facebook").Strategy;

/* PASSPORT FACEBOOK LOGIN */
passport.use(
  new FacebookStrategy(
    {
      clientID: config.authentication.facebook.appID,
      clientSecret: config.authentication.facebook.appSecret,
      callbackURL: config.authentication.facebook.callbackURL,
      profileFields: [
        "id",
        "displayName",
        "picture.width(600)",
        "emails",
        "locale"
      ],
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    (req, accessToken, refreshToken, profile, cb) => {
      try {
        process.nextTick(() => {
          FacebookSignIn(profile, getIP(req), (err, user) => {
            if (err || !user) {
              return cb(
                errorHandler(
                  "PASSPORT_FACEBOOK",
                  500,
                  i18n.__("FACEBOOK_LOGIN_ERROR"),
                  err
                )
              );
            }
            return cb(null, user);
          });
        });
      } catch (e) {
        return done(
          errorHandler(
            "PASSPORT_FACEBOOK",
            500,
            i18n.__("FACEBOOK_LOGIN_ERROR"),
            e
          ),
          false
        );
      }
    }
  )
);

module.exports = passport;
