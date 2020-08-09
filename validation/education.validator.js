const validator = require("validator");
const isEmpty = require("./validation.utils");

module.exports = validateEducationInput = (data) => {
  let { school, from } = data;
  let errors = {};

  school = !isEmpty(school) ? school : "";
  from = !isEmpty(from) ? from : "";

  if (validator.isEmpty(school)) errors.school = "School field is required";
  if (validator.isEmpty(from)) errors.from = "From date field is required";

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
