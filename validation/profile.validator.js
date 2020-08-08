const validator = require("validator");
const isEmpty = require("./validation.utils");

const validateProfile = (data) => {
  const errors = {};

  return {
    errors,
    isValid: isEmpty(errors),
  };
};

module.exports = validateProfile;
