const ERROR_MESSAGES = require("./errorMessages");
const PATTERN_RULE = require("./validatePatterns");
const { isValidEmail, isValidPassword } = require("./validUtils");

function validateLogin(data) {
  const errors = {};

  if (!isValidEmail(data.email)) {
    errors.email = ERROR_MESSAGES.EMAIL_NOT_RULE;
  }

  if (!isValidPassword(data.password)) {
    errors.password = ERROR_MESSAGES.PASSWORD_NOT_RULE;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

module.exports = validateLogin;
