const validator = require("validator");
const isEmpty = require("./validation.utils");

module.exports = validateRegisterInput = (data) => {
  let { name, email, password, confirm_password } = data;
  let errors = {};

  name = !isEmpty(name) ? name : "";
  email = !isEmpty(email) ? email : "";
  password = !isEmpty(password) ? password : "";
  confirm_password = !isEmpty(confirm_password) ? confirm_password : "";

  // name must be between 2 and 50 characters
  if (!validator.isLength(name, { min: 2, max: 50 }))
    errors.name = "Name must be between 2 and 50 characters";

  if (validator.isEmpty(name)) errors.name = "Name field is required";

  if (validator.isEmpty(email)) errors.email = "Email field is required";

  if (!validator.isEmail(email)) errors.email = "Invalid email";

  if (validator.isEmpty(password))
    errors.password = "Password field is required";

  if (validator.isEmpty(confirm_password))
    errors.confirm_password = "confirm password field is required";

  if (!validator.isLength(password, { min: 6, max: 30 }))
    errors.password = "Password must be atleast 6 characters long";

  if (!validator.equals(password, confirm_password))
    errors.confirm_password = "Passwords must match";

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
