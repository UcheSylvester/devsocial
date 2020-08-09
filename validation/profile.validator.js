const validator = require("validator");
const isEmpty = require("./validation.utils");

const validateProfileInput = (data) => {
  let { handle, status, skills, facebook, twitter, website, instagram } = data;
  const errors = {};

  handle = !isEmpty(handle) ? handle : "";
  status = !isEmpty(status) ? status : "";
  skills = !isEmpty(skills) ? skills : "";

  if (!validator.isLength(handle, { min: 2, max: 40 }))
    errors.handle = "Handle must be between 2 and 40 characters";

  if (validator.isEmpty(status)) errors.status = "Status is required";
  if (validator.isEmpty(skills)) errors.skills = "Skills is required";

  if (!isEmpty(facebook) && !validator.isURL(facebook))
    errors.facebook = "Not a valid URL";
  if (!isEmpty(twitter) && !validator.isURL(twitter))
    errors.twitter = "Not a valid URL";
  if (!isEmpty(website) && !validator.isURL(website))
    errors.website = "Not a valid URL";
  if (!isEmpty(instagram) && !validator.isURL(instagram))
    errors.instagram = "Not a valid URL";

  return {
    errors,
    isValid: isEmpty(errors),
  };
};

module.exports = validateProfileInput;
