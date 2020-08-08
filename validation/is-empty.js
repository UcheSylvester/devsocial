const isEmpty = (value) =>
  value === undefined ||
  value === null ||
  (typeof value === "object" && !Object.keys(value).length) ||
  (typeof value === "string" && !value.trim().length);

module.exports = isEmpty;
