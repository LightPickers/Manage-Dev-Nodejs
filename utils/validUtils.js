const validator = require("validator");
const PATTERN_RULE = require("./validatePatterns");

function isUndefined(value) {
  return value === undefined;
}
function isValidString(value) {
  return typeof value === "string" && !validator.isEmpty(value.trim());
}
function isValidInteger(value) {
  return (
    typeof value === "number" && validator.isInt(String(value), { min: 0 })
  );
}
function isValidBoolean(value) {
  return typeof value === "boolean";
}
function isValidDate(value) {
  return validator.isDate(value, { format: "YYYY-MM-DD", strictMode: true });
}
function isValidEmail(value) {
  return validator.isEmail(value);
}
function isValidPassword(value) {
  return PATTERN_RULE.PASSWORD_PATTERN.test(value);
}
function isValidUrl(value) {
  return PATTERN_RULE.URL_PATTERN.test(value);
}
function isValidPhone(value) {
  return PATTERN_RULE.PHONE_PATTERN.test(value);
}
function isValidName(value) {
  return PATTERN_RULE.NAME_PATTERN.test(value);
}
function isValidArrayOfString(value) {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string" && item.trim() !== "")
  );
}
function isValidArrayOfURL(value) {
  return (
    Array.isArray(value) &&
    value.every((item) => PATTERN_RULE.URL_PATTERN.test(item))
  );
}
function isValidObject(value) {
  return typeof value === "object";
}
function isValidQuillText(value) {
  return typeof value === "string";
}
function isValidQuillImage(value) {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof value.image === "string" &&
    PATTERN_RULE.IMAGE_URL_PATTERN.test(value.image)
  );
}
async function checkProduct(productsRepo, product_id) {
  return await productsRepo.findOne({
    where: { id: product_id },
  });
}

module.exports = {
  isUndefined,
  isValidString,
  isValidInteger,
  isValidBoolean,
  isValidDate,
  isValidEmail,
  isValidPassword,
  isValidUrl,
  isValidPhone,
  isValidName,
  isValidArrayOfString,
  isValidArrayOfURL,
  isValidObject,
  isValidQuillText,
  isValidQuillImage,
  checkProduct,
};
