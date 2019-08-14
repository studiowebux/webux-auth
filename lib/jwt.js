// TODO add header

const jwt = require("jsonwebtoken");

const GenerateAccessToken = (options, user) => {
  const token = jwt.sign(user, options.accessSecret, {
    expiresIn: options.accessLife
  });

  // TODO : Save the token with all the required information

  return token;
};

const GenerateRefreshToken = (options, userID) => {
  if (!userID) {
    throw new Error("The user ID is required");
  }
  const token = jwt.sign(
    {
      userID
    },
    options.refreshSecret,
    {
      expiresIn: options.refreshLife
    }
  );

  // TODO : Save the token with all the required information

  return token;
};

const RefreshAccessToken = () => {};

const RevokeAccessToken = () => {};

const RevokeRefreshToken = () => {};

const GenerateJWT = (options, user, userID) => {
  try {
    const token = {};
    token.access = GenerateAccessToken(options, user);
    token.refresh = GenerateRefreshToken(options, user[options.id]);

    return token;
  } catch (e) {
    throw e;
  }
};

module.exports = { GenerateJWT };
