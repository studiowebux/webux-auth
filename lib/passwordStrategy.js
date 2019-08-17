//TODO add header
"use strict";

const checkPassword = (regex, password) => {
  if (password.match(regex)) {
    return true;
  }
  return false;
};

module.exports = { checkPassword };
