// TODO HEADER

const isAuthenticated = (passport, log = console) => {
  return (req, res, next) => {
    try {
      const accessToken =
        req.headers.Authorization || req.headers.authorization;

      if (accessToken) {
        passport.authenticate(
          "jwt",
          {
            session: false
          },
          (err, user) => {
            if (err) {
              log.error(err);
              return res.status(403).json({ msg: "You are not authenticated" });
            } else if (!err && user) {
              req.user = user;
              return next(null, user);
            } else {
              return res.status(403).json({ msg: "You are not authenticated" });
            }
          }
        )(req, res, next);
      } else {
        return res.status(403).json({ msg: "You are not authenticated" });
      }
    } catch (e) {
      log.error(e);
    }
  };
};

module.exports = { isAuthenticated };
