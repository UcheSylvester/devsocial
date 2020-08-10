const validator = require("validator");
const isEmpty = require("./validation.utils");

module.exports = validatePostInputs = (data) => {
  let { text } = data;
  let errors = {};

  text = !isEmpty(text) ? text : "";

  if (validator.isEmpty(text)) errors.text = "Text field is required";

  if (!validator.isLength(text, { min: 0, max: 300 }))
    errors.text = "Post must not be greater than 300 characters";

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
