const validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = validateRegisterInput = (data) => {
  const { name } = data;
  let errors = {};

  if (!validator.isLength(name, { min: 2, max: 50 }))
    errors.name = "Name must be between 2 and 50 characters";

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
