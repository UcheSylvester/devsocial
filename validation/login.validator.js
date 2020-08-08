const validator = require("validator");
const isEmpty = require("./validation.utils");

module.exports = validateRegisterInput = (data) => {
  let { email, password } = data;
  let errors = {};

  email = !isEmpty(email) ? email : "";
  password = !isEmpty(password) ? password : "";

  if (validator.isEmpty(email)) errors.email = "Email field is required";

  if (!validator.isEmail(email)) errors.email = "Invalid email";

  if (validator.isEmpty(password))
    errors.password = "Password field is required";

  if (!validator.isLength(password, { min: 6, max: 30 }))
    errors.password = "Password must be atleast 6 characters long";

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
