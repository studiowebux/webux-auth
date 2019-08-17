module.exports = {
  local: {
    username: "email",
    password: "password",
    passwordStrategy: {
      enabled: false,
      regex: "",
      message: "The password strategy is enabled and you must be compliant."
    },
    autoLogonOnRegister: true,
    autoActivate: false
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "SHUUUT!",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "SHUUUUT!",
    accessLife: 60, // 900
    refreshLife: 86400,
    scheme: "Bearer",
    id: "id",
    serializeUser: ["_id", "fullname"]
  },
  redis:{
    mock: true,
  }
};
