const isEmpty = (value) =>
  value === undefined ||
  value === null ||
  (typeof value === "object" && !Object.keys(value).length) ||
  (typeof value === "string" && !value.trim().length);

// const checkForEmpty = () =>
// if (validator.isEmpty(name)) errors.name = "Name field is required";

module.exports = isEmpty;
