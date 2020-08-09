const validator = require("validator");
const isEmpty = require("./validation.utils");

module.exports = validateExperienceInput = (data) => {
  let { title, from } = data;
  let errors = {};

  title = !isEmpty(title) ? title : "";
  from = !isEmpty(from) ? from : "";

  if (validator.isEmpty(title))
    errors.title = "Job title/position field is required";
  if (validator.isEmpty(from)) errors.from = "From date field is required";

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
