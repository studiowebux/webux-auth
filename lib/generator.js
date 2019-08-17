// TODO: add header

"use strict";

const GenerateCode = len => {
  const CHAR =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@$";
  const low = 0;
  const high = CHAR.length;
  let randString = "";
  for (let i = 0; i < len; i++) {
    randString += CHAR[Math.floor(Math.random() * (high - low) + low)];
  }
  return randString;
};

module.exports = { GenerateCode };
