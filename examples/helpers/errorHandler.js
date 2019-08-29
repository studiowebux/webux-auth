// This function has been taken from the webux-errorhandler module
// You can use the module webux-errorhandler, or use this one or create your own,
// but keep in mind, the isAuthenticated function will require 4 parameters,

/**
 * this function is use to throw new error with a specific format.
 * @param {Number} code The code of the HTTP status, optional
 * @param {String} msg The message to return, optional
 * @param {Object} extra any extra fields to return, optional
 * @param {String} devMsg The development message to return, optional
 * @return {Error} return an error object
 */
const errorHandler = (code, msg, extra, devMsg) => {
  let error = new Error();

  error.code = code || 500;
  error.message = msg || "";
  error.extra = extra || {};
  error.devMessage = devMsg || "";

  return error;
};

module.exports = { errorHandler };
