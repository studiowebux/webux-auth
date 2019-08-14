// TODO ADD HEADER

const options = {
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "SHUUUT!",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "SHUUUUT!",
    accessLife: 900,
    refreshLife: 86400,
    scheme: "Bearer",
    id: "_id"
  }
};
